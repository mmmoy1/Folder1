"""Volatile asset store.

The store is "volatile" in three senses:

* assets carry an explicit TTL and are evicted automatically once expired;
* the store can be backed by a temporary directory that is wiped when the
  store is closed (``persistent=False``);
* the store enforces an upper bound on the number and total size of live
  assets, dropping the oldest entries when the budget is exceeded.

This is the surface the downstream "content creation line" ingests: it
polls :meth:`VolatileStore.list_live` (or reads the on-disk manifest) and
pulls bytes for each asset before the TTL elapses.
"""

from __future__ import annotations

import os
import shutil
import tempfile
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterator

DEFAULT_TTL_SECONDS = 300.0
DEFAULT_MAX_ASSETS = 256
DEFAULT_MAX_BYTES = 512 * 1024 * 1024  # 512 MiB


@dataclass
class StoredAsset:
    """A single live asset inside a :class:`VolatileStore`."""

    asset_id: str
    path: Path
    size_bytes: int
    created_at: float
    expires_at: float
    kind: str
    metadata: dict = field(default_factory=dict)

    @property
    def is_expired(self) -> bool:
        return time.time() >= self.expires_at

    def ttl_remaining(self) -> float:
        return max(0.0, self.expires_at - time.time())


class VolatileStore:
    """Ephemeral on-disk store with TTL eviction and size budgets."""

    def __init__(
        self,
        root: str | os.PathLike | None = None,
        *,
        ttl_seconds: float = DEFAULT_TTL_SECONDS,
        max_assets: int = DEFAULT_MAX_ASSETS,
        max_bytes: int = DEFAULT_MAX_BYTES,
        persistent: bool = False,
    ) -> None:
        if ttl_seconds <= 0:
            raise ValueError("ttl_seconds must be > 0")
        if max_assets <= 0:
            raise ValueError("max_assets must be > 0")
        if max_bytes <= 0:
            raise ValueError("max_bytes must be > 0")

        self._owns_root = root is None
        if root is None:
            self._root = Path(tempfile.mkdtemp(prefix="vimgen-"))
        else:
            self._root = Path(root)
            self._root.mkdir(parents=True, exist_ok=True)

        self.ttl_seconds = float(ttl_seconds)
        self.max_assets = int(max_assets)
        self.max_bytes = int(max_bytes)
        self.persistent = bool(persistent)

        self._assets: dict[str, StoredAsset] = {}
        self._lock = threading.Lock()
        self._closed = False

    # ------------------------------------------------------------------ basics
    @property
    def root(self) -> Path:
        return self._root

    def __len__(self) -> int:
        with self._lock:
            self._evict_expired_locked()
            return len(self._assets)

    def __iter__(self) -> Iterator[StoredAsset]:
        return iter(self.list_live())

    def __enter__(self) -> "VolatileStore":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()

    # -------------------------------------------------------------- mutations
    def put(
        self,
        asset_id: str,
        data: bytes,
        *,
        kind: str,
        suffix: str = ".png",
        ttl_seconds: float | None = None,
        metadata: dict | None = None,
    ) -> StoredAsset:
        """Write ``data`` into the store and return its handle."""
        if self._closed:
            raise RuntimeError("store is closed")
        if not asset_id or "/" in asset_id or "\\" in asset_id:
            raise ValueError(f"invalid asset_id {asset_id!r}")

        ttl = float(self.ttl_seconds if ttl_seconds is None else ttl_seconds)
        if ttl <= 0:
            raise ValueError("ttl_seconds must be > 0")

        now = time.time()
        path = self._root / f"{asset_id}{suffix}"
        tmp = path.with_suffix(path.suffix + ".tmp")
        tmp.write_bytes(data)
        os.replace(tmp, path)

        asset = StoredAsset(
            asset_id=asset_id,
            path=path,
            size_bytes=len(data),
            created_at=now,
            expires_at=now + ttl,
            kind=kind,
            metadata=dict(metadata or {}),
        )
        with self._lock:
            old = self._assets.pop(asset_id, None)
            if old is not None and old.path != path:
                self._remove_file(old.path)
            self._assets[asset_id] = asset
            self._evict_expired_locked()
            self._enforce_budget_locked()
        return asset

    def get(self, asset_id: str) -> StoredAsset | None:
        with self._lock:
            self._evict_expired_locked()
            return self._assets.get(asset_id)

    def read(self, asset_id: str) -> bytes | None:
        asset = self.get(asset_id)
        if asset is None:
            return None
        try:
            return asset.path.read_bytes()
        except FileNotFoundError:
            with self._lock:
                self._assets.pop(asset_id, None)
            return None

    def list_live(self) -> list[StoredAsset]:
        with self._lock:
            self._evict_expired_locked()
            return sorted(self._assets.values(), key=lambda a: a.created_at)

    def total_bytes(self) -> int:
        with self._lock:
            self._evict_expired_locked()
            return sum(a.size_bytes for a in self._assets.values())

    def evict_expired(self) -> int:
        with self._lock:
            return self._evict_expired_locked()

    def close(self) -> None:
        with self._lock:
            if self._closed:
                return
            self._closed = True
            if not self.persistent and self._owns_root:
                shutil.rmtree(self._root, ignore_errors=True)
            else:
                for asset in list(self._assets.values()):
                    self._remove_file(asset.path)
            self._assets.clear()

    # ---------------------------------------------------------------- helpers
    def _evict_expired_locked(self) -> int:
        now = time.time()
        expired = [aid for aid, a in self._assets.items() if a.expires_at <= now]
        for aid in expired:
            asset = self._assets.pop(aid)
            self._remove_file(asset.path)
        return len(expired)

    def _enforce_budget_locked(self) -> None:
        if len(self._assets) <= self.max_assets and self._sum_bytes_locked() <= self.max_bytes:
            return
        ordered = sorted(self._assets.values(), key=lambda a: a.created_at)
        for asset in ordered:
            if (
                len(self._assets) <= self.max_assets
                and self._sum_bytes_locked() <= self.max_bytes
            ):
                return
            self._assets.pop(asset.asset_id, None)
            self._remove_file(asset.path)

    def _sum_bytes_locked(self) -> int:
        return sum(a.size_bytes for a in self._assets.values())

    @staticmethod
    def _remove_file(path: Path) -> None:
        try:
            path.unlink()
        except FileNotFoundError:
            pass
        except OSError:
            pass
