# vimgen — volatile image generator

`vimgen` produces ephemeral, procedurally-generated images and emits an
ingestion manifest describing them. It's designed to feed a downstream
content-creation pipeline (the "content creation line") that polls the
manifest, pulls each asset before its TTL expires, and processes it.

The word *volatile* is meant literally: every asset has a time-to-live, the
store enforces hard caps on asset count and total bytes, and (by default)
the backing temp directory is wiped on shutdown. If the consumer doesn't
ingest fast enough, assets disappear — exactly the property you want for a
pipeline that should never accumulate stale visual scratch.

## Features

- **5 procedural generators** — gradient, noise (multi-octave value noise),
  random shapes, glitch-band, and voronoi cells.
- **Deterministic recipes** — each asset is reproducible from
  `(kind, size, seed, params)`; the manifest carries the full recipe so the
  pipeline can re-derive the bytes later if it wants to.
- **Volatile store** — per-asset TTL, max-asset and max-bytes budgets,
  automatic eviction of the oldest entries when budgets are exceeded.
- **Ingestion manifest** — versioned JSON sidecar (`vimgen.manifest` v1)
  with `asset_id`, `uri`, `recipe`, `created_at`, `expires_at`, etc.
- **CLI** — `vimgen generate` for one-shot batches, `vimgen feed` for a
  continuous producer that rewrites the manifest each batch, and
  `vimgen inspect` for a quick summary.

## Install

```bash
pip install -e .
```

Requires Python 3.10+, Pillow, and NumPy.

## CLI

### One-shot batch

```bash
vimgen generate \
  --count 12 \
  --width 1024 --height 1024 \
  --kinds gradient noise shapes glitch voronoi \
  --out ./drop \
  --manifest ./drop/manifest.json \
  --ttl 300
```

This writes 12 PNGs into `./drop/` and a manifest at
`./drop/manifest.json`. The downstream pipeline can read the manifest and
fetch each asset by its `uri` (a `file://` URL in this mode).

### Continuous feed

```bash
vimgen feed \
  --batch-size 6 --interval 10 \
  --batches 0 \
  --out ./drop --ttl 60
```

Every 10 seconds `vimgen` produces 6 fresh images, rewrites
`./drop/manifest.json`, and prints one JSON line per batch on stdout.
Expired assets are deleted on each tick. Stop with Ctrl-C.

### Inspect

```bash
vimgen inspect ./drop/manifest.json
```

## Programmatic use

```python
from vimgen import VolatileStore, ImageRecipe
from vimgen.pipeline import emit_batch

store = VolatileStore(ttl_seconds=60)        # temp dir, wiped on close()
recipes = [
    ImageRecipe(kind="gradient", width=512, height=512, seed=i)
    for i in range(4)
]
manifest = emit_batch(recipes, store, fmt="PNG")
manifest.write(store.root / "manifest.json")
```

## Manifest schema (v1)

```json
{
  "schema": "vimgen.manifest",
  "version": 1,
  "generated_at": 1748278800.0,
  "ttl_seconds": 60.0,
  "entries": [
    {
      "asset_id": "1d90ce7e2f7ba139",
      "uri": "file:///tmp/vimgen-xyz/1d90ce7e2f7ba139.png",
      "kind": "gradient",
      "width": 1024, "height": 1024,
      "size_bytes": 18234,
      "fingerprint": "1d90ce7e2f7ba139",
      "recipe": { "kind": "gradient", "width": 1024, "height": 1024, "seed": 0, "params": {} },
      "created_at": 1748278800.0,
      "expires_at": 1748278860.0,
      "metadata": { "format": "PNG" }
    }
  ]
}
```

## Tests

```bash
pytest
```
