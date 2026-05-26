"""Command-line interface for vimgen.

Examples
--------
Generate 12 ephemeral images into a temp store, write the manifest::

    vimgen generate --count 12 --out ./drop --manifest ./drop/manifest.json

Keep producing batches every 10s until interrupted (good for feeding a
content creation pipeline that polls the manifest)::

    vimgen feed --out ./drop --batch-size 6 --interval 10 --ttl 60
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

from .generators import (
    ImageRecipe,
    available_kinds,
    iter_recipes,
)
from .pipeline import emit_batch
from .store import (
    DEFAULT_MAX_ASSETS,
    DEFAULT_MAX_BYTES,
    DEFAULT_TTL_SECONDS,
    VolatileStore,
)


def _add_common(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Directory to write images into (defaults to a temp dir).",
    )
    parser.add_argument(
        "--width", type=int, default=1024, help="Image width in pixels."
    )
    parser.add_argument(
        "--height", type=int, default=1024, help="Image height in pixels."
    )
    parser.add_argument(
        "--seed", type=int, default=0, help="Base RNG seed."
    )
    parser.add_argument(
        "--kinds",
        nargs="+",
        choices=available_kinds(),
        default=list(available_kinds()),
        help="Generator kinds to cycle through.",
    )
    parser.add_argument(
        "--format",
        default="PNG",
        choices=["PNG", "JPEG", "WEBP"],
        help="Image encoding.",
    )
    parser.add_argument(
        "--ttl",
        type=float,
        default=DEFAULT_TTL_SECONDS,
        help="Asset TTL in seconds.",
    )
    parser.add_argument(
        "--max-assets",
        type=int,
        default=DEFAULT_MAX_ASSETS,
        help="Maximum number of live assets retained in the store.",
    )
    parser.add_argument(
        "--max-bytes",
        type=int,
        default=DEFAULT_MAX_BYTES,
        help="Maximum total bytes of live assets.",
    )


def _open_store(args: argparse.Namespace) -> VolatileStore:
    persistent = args.out is not None
    return VolatileStore(
        root=args.out,
        ttl_seconds=args.ttl,
        max_assets=args.max_assets,
        max_bytes=args.max_bytes,
        persistent=persistent,
    )


def cmd_generate(args: argparse.Namespace) -> int:
    store = _open_store(args)
    try:
        recipes = list(
            iter_recipes(
                args.kinds,
                args.count,
                width=args.width,
                height=args.height,
                base_seed=args.seed,
            )
        )
        manifest = emit_batch(recipes, store, fmt=args.format)
        manifest_path = (
            Path(args.manifest)
            if args.manifest
            else (Path(store.root) / "manifest.json")
        )
        manifest.write(manifest_path)
        print(
            json.dumps(
                {
                    "store_root": str(store.root),
                    "manifest": str(manifest_path),
                    "count": len(manifest.entries),
                    "ttl_seconds": manifest.ttl_seconds,
                },
                indent=2,
            )
        )
        return 0
    finally:
        if args.out is None:
            store.close()


def cmd_feed(args: argparse.Namespace) -> int:
    store = _open_store(args)
    manifest_path = (
        Path(args.manifest)
        if args.manifest
        else (Path(store.root) / "manifest.json")
    )
    try:
        batch = 0
        produced = 0
        max_batches = args.batches if args.batches > 0 else None
        try:
            while max_batches is None or batch < max_batches:
                recipes = list(
                    iter_recipes(
                        args.kinds,
                        args.batch_size,
                        width=args.width,
                        height=args.height,
                        base_seed=args.seed + produced,
                    )
                )
                manifest = emit_batch(recipes, store, fmt=args.format)
                manifest.write(manifest_path)
                produced += len(recipes)
                batch += 1
                print(
                    json.dumps(
                        {
                            "event": "batch",
                            "batch": batch,
                            "size": len(recipes),
                            "live": len(store),
                            "manifest": str(manifest_path),
                        }
                    ),
                    flush=True,
                )
                if max_batches is not None and batch >= max_batches:
                    break
                time.sleep(args.interval)
        except KeyboardInterrupt:
            pass
        return 0
    finally:
        if args.out is None:
            store.close()


def cmd_inspect(args: argparse.Namespace) -> int:
    from .manifest import IngestManifest

    manifest = IngestManifest.load(args.manifest)
    print(
        json.dumps(
            {
                "schema": manifest.schema,
                "version": manifest.version,
                "ttl_seconds": manifest.ttl_seconds,
                "entries": len(manifest.entries),
                "kinds": sorted({e.kind for e in manifest.entries}),
                "total_bytes": sum(e.size_bytes for e in manifest.entries),
            },
            indent=2,
        )
    )
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="vimgen",
        description="Volatile image generator for content creation pipelines.",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_gen = sub.add_parser(
        "generate", help="Generate a single batch of images and a manifest."
    )
    _add_common(p_gen)
    p_gen.add_argument(
        "--count", type=int, default=8, help="Number of images to produce."
    )
    p_gen.add_argument(
        "--manifest",
        type=Path,
        default=None,
        help="Path to write the manifest JSON (defaults to <out>/manifest.json).",
    )
    p_gen.set_defaults(func=cmd_generate)

    p_feed = sub.add_parser(
        "feed",
        help="Continuously produce batches into a store + manifest "
        "(for an ingesting content pipeline).",
    )
    _add_common(p_feed)
    p_feed.add_argument(
        "--batch-size", type=int, default=8, help="Images per batch."
    )
    p_feed.add_argument(
        "--interval",
        type=float,
        default=5.0,
        help="Seconds to sleep between batches.",
    )
    p_feed.add_argument(
        "--batches",
        type=int,
        default=0,
        help="Number of batches to produce (0 = forever, until Ctrl-C).",
    )
    p_feed.add_argument(
        "--manifest",
        type=Path,
        default=None,
        help="Path to write/rewrite the manifest JSON.",
    )
    p_feed.set_defaults(func=cmd_feed)

    p_ins = sub.add_parser(
        "inspect", help="Summarise a previously written manifest file."
    )
    p_ins.add_argument("manifest", type=Path)
    p_ins.set_defaults(func=cmd_inspect)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return int(args.func(args) or 0)


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
