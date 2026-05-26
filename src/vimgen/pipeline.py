"""High-level orchestration: generate -> store -> manifest."""

from __future__ import annotations

import time
from pathlib import Path
from typing import Iterable

from .generators import ImageRecipe, encode_image, generate_image
from .manifest import IngestManifest, ManifestEntry
from .store import StoredAsset, VolatileStore


def emit_batch(
    recipes: Iterable[ImageRecipe],
    store: VolatileStore,
    *,
    fmt: str = "PNG",
    ttl_seconds: float | None = None,
    extra_metadata: dict | None = None,
) -> IngestManifest:
    """Generate every recipe, store each rendered image, return a manifest."""
    suffix = "." + fmt.lower()
    manifest = IngestManifest(
        ttl_seconds=float(
            ttl_seconds if ttl_seconds is not None else store.ttl_seconds
        )
    )
    for recipe in recipes:
        img = generate_image(recipe)
        data = encode_image(img, fmt=fmt)
        asset_id = recipe.fingerprint()
        stored = store.put(
            asset_id,
            data,
            kind=recipe.kind,
            suffix=suffix,
            ttl_seconds=ttl_seconds,
            metadata={"recipe": recipe.to_dict(), **(extra_metadata or {})},
        )
        manifest.add(_entry_for(stored, recipe, fmt))
    return manifest


def _entry_for(
    asset: StoredAsset, recipe: ImageRecipe, fmt: str
) -> ManifestEntry:
    return ManifestEntry(
        asset_id=asset.asset_id,
        uri=Path(asset.path).resolve().as_uri(),
        kind=recipe.kind,
        width=recipe.width,
        height=recipe.height,
        size_bytes=asset.size_bytes,
        fingerprint=recipe.fingerprint(),
        recipe=recipe.to_dict(),
        created_at=asset.created_at,
        expires_at=asset.expires_at,
        metadata={"format": fmt, **asset.metadata},
    )


def stream_batches(
    recipe_factory,
    store: VolatileStore,
    *,
    batch_size: int,
    batches: int,
    fmt: str = "PNG",
    sleep_between: float = 0.0,
):
    """Run ``batches`` generations and yield each manifest as it is produced.

    ``recipe_factory(batch_index, batch_size)`` must return an iterable of
    :class:`ImageRecipe`. This is the typical entry point for a long-running
    feeder process attached to the content-creation line.
    """
    for i in range(batches):
        recipes = list(recipe_factory(i, batch_size))
        yield emit_batch(recipes, store, fmt=fmt)
        if sleep_between > 0 and i + 1 < batches:
            time.sleep(sleep_between)
