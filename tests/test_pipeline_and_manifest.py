import json
from pathlib import Path

from vimgen.generators import ImageRecipe
from vimgen.manifest import IngestManifest, SCHEMA_NAME, SCHEMA_VERSION
from vimgen.pipeline import emit_batch
from vimgen.store import VolatileStore


def test_emit_batch_writes_assets_and_manifest_entries(tmp_path):
    store = VolatileStore(root=tmp_path, persistent=True, ttl_seconds=60)
    recipes = [
        ImageRecipe(kind="gradient", width=32, height=32, seed=1),
        ImageRecipe(kind="noise", width=32, height=32, seed=2),
    ]
    manifest = emit_batch(recipes, store, fmt="PNG")
    assert len(manifest.entries) == 2
    for entry in manifest.entries:
        assert entry.uri.startswith("file://")
        assert entry.width == 32
        assert entry.size_bytes > 0
        assert Path(entry.uri.replace("file://", "")).exists()
        assert entry.recipe["kind"] == entry.kind


def test_manifest_roundtrip(tmp_path):
    store = VolatileStore(root=tmp_path, persistent=True, ttl_seconds=60)
    recipes = [ImageRecipe(kind="shapes", width=32, height=32, seed=3)]
    manifest = emit_batch(recipes, store)
    manifest_path = tmp_path / "manifest.json"
    manifest.write(manifest_path)

    raw = json.loads(manifest_path.read_text())
    assert raw["schema"] == SCHEMA_NAME
    assert raw["version"] == SCHEMA_VERSION
    assert raw["entries"][0]["kind"] == "shapes"

    loaded = IngestManifest.load(manifest_path)
    assert len(loaded.entries) == 1
    assert loaded.entries[0].fingerprint == manifest.entries[0].fingerprint


def test_manifest_load_rejects_bad_schema(tmp_path):
    bad = tmp_path / "m.json"
    bad.write_text(json.dumps({"schema": "other", "version": 1, "ttl_seconds": 1, "entries": [], "generated_at": 0}))
    import pytest

    with pytest.raises(ValueError):
        IngestManifest.load(bad)


def test_duplicate_recipe_dedupes_by_fingerprint(tmp_path):
    store = VolatileStore(root=tmp_path, persistent=True, ttl_seconds=60)
    r = ImageRecipe(kind="gradient", width=16, height=16, seed=5)
    emit_batch([r, r], store)
    assert len(store) == 1
