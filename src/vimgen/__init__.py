"""vimgen: Volatile image generator for content creation pipelines.

The package exposes three primary building blocks:

* :class:`vimgen.generators.ImageRecipe` and the ``generate_*`` functions, which
  produce procedural images deterministically from a seed.
* :class:`vimgen.store.VolatileStore`, an ephemeral on-disk (or in-memory)
  store with per-asset TTLs and automatic eviction.
* :class:`vimgen.manifest.IngestManifest`, a JSON sidecar schema designed to be
  ingested by a downstream content-creation pipeline (referred to in the brief
  as the "content creation line").
"""

from .generators import (
    ImageRecipe,
    GeneratorKind,
    generate_image,
    available_kinds,
)
from .store import VolatileStore, StoredAsset
from .manifest import IngestManifest, ManifestEntry

__all__ = [
    "ImageRecipe",
    "GeneratorKind",
    "generate_image",
    "available_kinds",
    "VolatileStore",
    "StoredAsset",
    "IngestManifest",
    "ManifestEntry",
]

__version__ = "0.1.0"
