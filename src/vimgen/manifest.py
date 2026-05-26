"""Ingestion manifest.

This is the contract between the volatile image generator and the downstream
"content creation line". The pipeline polls or reads a manifest file and pulls
each referenced asset before its ``expires_at`` timestamp passes.

Manifest schema (v1)::

    {
      "schema": "vimgen.manifest",
      "version": 1,
      "generated_at": <unix-seconds>,
      "ttl_seconds": <float>,
      "entries": [
        {
          "asset_id": "...",
          "uri": "file:///.../foo.png" | "store://foo",
          "kind": "gradient" | ...,
          "width": 1024,
          "height": 1024,
          "size_bytes": 12345,
          "fingerprint": "abcd...",
          "recipe": { ... },
          "created_at": <unix-seconds>,
          "expires_at": <unix-seconds>,
          "metadata": { ... }
        }
      ]
    }
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any, Iterable

SCHEMA_NAME = "vimgen.manifest"
SCHEMA_VERSION = 1


@dataclass
class ManifestEntry:
    asset_id: str
    uri: str
    kind: str
    width: int
    height: int
    size_bytes: int
    fingerprint: str
    recipe: dict[str, Any]
    created_at: float
    expires_at: float
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class IngestManifest:
    ttl_seconds: float
    entries: list[ManifestEntry] = field(default_factory=list)
    generated_at: float = field(default_factory=time.time)
    schema: str = SCHEMA_NAME
    version: int = SCHEMA_VERSION

    def add(self, entry: ManifestEntry) -> None:
        self.entries.append(entry)

    def extend(self, entries: Iterable[ManifestEntry]) -> None:
        for e in entries:
            self.add(e)

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema": self.schema,
            "version": self.version,
            "generated_at": self.generated_at,
            "ttl_seconds": self.ttl_seconds,
            "entries": [e.to_dict() for e in self.entries],
        }

    def to_json(self, *, indent: int | None = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent, sort_keys=True)

    def write(self, path: str | Path) -> Path:
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(self.to_json(), encoding="utf-8")
        return p

    @classmethod
    def load(cls, path: str | Path) -> "IngestManifest":
        raw = json.loads(Path(path).read_text(encoding="utf-8"))
        if raw.get("schema") != SCHEMA_NAME:
            raise ValueError(
                f"unexpected schema {raw.get('schema')!r}; expected {SCHEMA_NAME!r}"
            )
        if raw.get("version") != SCHEMA_VERSION:
            raise ValueError(
                f"unsupported manifest version {raw.get('version')!r}"
            )
        entries = [ManifestEntry(**e) for e in raw.get("entries", [])]
        return cls(
            ttl_seconds=float(raw["ttl_seconds"]),
            entries=entries,
            generated_at=float(raw["generated_at"]),
        )
