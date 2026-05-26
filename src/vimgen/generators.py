"""Procedural image generators.

Each generator is deterministic given a recipe (kind + seed + size + params).
That determinism matters: it lets the downstream content-creation pipeline
re-derive an asset from its manifest without having to keep the bytes.
"""

from __future__ import annotations

import colorsys
import hashlib
import io
import math
from dataclasses import dataclass, field, asdict
from typing import Any, Iterable, Literal

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

GeneratorKind = Literal["gradient", "noise", "shapes", "glitch", "voronoi"]

_ALL_KINDS: tuple[GeneratorKind, ...] = (
    "gradient",
    "noise",
    "shapes",
    "glitch",
    "voronoi",
)


def available_kinds() -> tuple[GeneratorKind, ...]:
    """Return the set of supported generator kinds."""
    return _ALL_KINDS


@dataclass(frozen=True)
class ImageRecipe:
    """A reproducible description of a single generated image."""

    kind: GeneratorKind
    width: int = 1024
    height: int = 1024
    seed: int = 0
    params: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.kind not in _ALL_KINDS:
            raise ValueError(
                f"unknown generator kind {self.kind!r}; expected one of {_ALL_KINDS}"
            )
        if self.width <= 0 or self.height <= 0:
            raise ValueError("width and height must be positive")
        if self.width > 8192 or self.height > 8192:
            raise ValueError("width/height must each be <= 8192")

    def fingerprint(self) -> str:
        """Stable short hash used to name and dedupe generated assets."""
        payload = repr(
            (
                self.kind,
                self.width,
                self.height,
                self.seed,
                sorted(self.params.items()),
            )
        ).encode("utf-8")
        return hashlib.sha256(payload).hexdigest()[:16]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def generate_image(recipe: ImageRecipe) -> Image.Image:
    """Render a recipe into a :class:`PIL.Image.Image` (RGB)."""
    rng = np.random.default_rng(recipe.seed)
    if recipe.kind == "gradient":
        return _gen_gradient(recipe, rng)
    if recipe.kind == "noise":
        return _gen_noise(recipe, rng)
    if recipe.kind == "shapes":
        return _gen_shapes(recipe, rng)
    if recipe.kind == "glitch":
        return _gen_glitch(recipe, rng)
    if recipe.kind == "voronoi":
        return _gen_voronoi(recipe, rng)
    raise AssertionError(f"unhandled kind {recipe.kind!r}")  # pragma: no cover


# ---------------------------------------------------------------------------
# Individual generators
# ---------------------------------------------------------------------------


def _random_palette(rng: np.random.Generator, n: int) -> list[tuple[int, int, int]]:
    base_hue = float(rng.random())
    palette: list[tuple[int, int, int]] = []
    for i in range(n):
        h = (base_hue + i / max(1, n) + float(rng.normal(0, 0.03))) % 1.0
        s = 0.45 + 0.5 * float(rng.random())
        v = 0.55 + 0.4 * float(rng.random())
        r, g, b = colorsys.hsv_to_rgb(h, s, v)
        palette.append((int(r * 255), int(g * 255), int(b * 255)))
    return palette


def _gen_gradient(recipe: ImageRecipe, rng: np.random.Generator) -> Image.Image:
    w, h = recipe.width, recipe.height
    stops = int(recipe.params.get("stops", 3))
    angle = float(recipe.params.get("angle_deg", rng.uniform(0, 360)))
    palette = _random_palette(rng, max(2, stops))

    theta = math.radians(angle)
    cos_t, sin_t = math.cos(theta), math.sin(theta)
    xs = np.arange(w, dtype=np.float32)
    ys = np.arange(h, dtype=np.float32)
    grid = (xs[None, :] * cos_t + ys[:, None] * sin_t)
    grid -= grid.min()
    if grid.max() > 0:
        grid /= grid.max()

    palette_arr = np.array(palette, dtype=np.float32)
    n = len(palette_arr) - 1
    scaled = grid * n
    lo = np.clip(np.floor(scaled).astype(np.int32), 0, n - 1)
    hi = lo + 1
    frac = (scaled - lo)[:, :, None]
    img = palette_arr[lo] * (1 - frac) + palette_arr[hi] * frac
    return Image.fromarray(img.astype(np.uint8), mode="RGB")


def _gen_noise(recipe: ImageRecipe, rng: np.random.Generator) -> Image.Image:
    w, h = recipe.width, recipe.height
    octaves = int(recipe.params.get("octaves", 4))
    monochrome = bool(recipe.params.get("monochrome", False))
    out = np.zeros((h, w, 3), dtype=np.float32)
    amp = 1.0
    total_amp = 0.0
    for o in range(octaves):
        scale = 2 ** o
        cells_y = max(2, h // (8 * scale))
        cells_x = max(2, w // (8 * scale))
        if monochrome:
            base = rng.random((cells_y, cells_x, 1)).astype(np.float32)
            base = np.repeat(base, 3, axis=2)
        else:
            base = rng.random((cells_y, cells_x, 3)).astype(np.float32)
        layer = np.array(
            Image.fromarray((base * 255).astype(np.uint8)).resize(
                (w, h), Image.BICUBIC
            ),
            dtype=np.float32,
        ) / 255.0
        out += layer * amp
        total_amp += amp
        amp *= 0.5
    out = (out / total_amp * 255).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, mode="RGB")


def _gen_shapes(recipe: ImageRecipe, rng: np.random.Generator) -> Image.Image:
    w, h = recipe.width, recipe.height
    count = int(recipe.params.get("count", 24))
    bg = _random_palette(rng, 1)[0]
    img = Image.new("RGB", (w, h), bg)
    draw = ImageDraw.Draw(img, "RGBA")
    palette = _random_palette(rng, max(3, count // 4))
    for _ in range(count):
        kind = rng.choice(["ellipse", "rect", "triangle"])
        color = palette[int(rng.integers(0, len(palette)))] + (
            int(rng.integers(120, 230)),
        )
        cx, cy = int(rng.integers(0, w)), int(rng.integers(0, h))
        size = int(rng.integers(min(w, h) // 16, min(w, h) // 3))
        if kind == "ellipse":
            draw.ellipse(
                (cx - size, cy - size, cx + size, cy + size), fill=color
            )
        elif kind == "rect":
            draw.rectangle(
                (cx - size, cy - size, cx + size, cy + size), fill=color
            )
        else:
            pts = [
                (cx, cy - size),
                (cx - size, cy + size),
                (cx + size, cy + size),
            ]
            draw.polygon(pts, fill=color)
    return img


def _gen_glitch(recipe: ImageRecipe, rng: np.random.Generator) -> Image.Image:
    base = _gen_gradient(recipe, np.random.default_rng(recipe.seed + 1))
    arr = np.array(base)
    bands = int(recipe.params.get("bands", 12))
    h = arr.shape[0]
    band_h = max(1, h // bands)
    for i in range(bands):
        y0 = i * band_h
        y1 = min(h, y0 + band_h)
        shift = int(rng.integers(-arr.shape[1] // 8, arr.shape[1] // 8))
        arr[y0:y1] = np.roll(arr[y0:y1], shift, axis=1)
        if rng.random() < 0.4:
            channel = int(rng.integers(0, 3))
            arr[y0:y1, :, channel] = np.roll(
                arr[y0:y1, :, channel], shift // 2, axis=1
            )
    img = Image.fromarray(arr, mode="RGB")
    if recipe.params.get("blur", True):
        img = img.filter(ImageFilter.GaussianBlur(radius=0.6))
    return img


def _gen_voronoi(recipe: ImageRecipe, rng: np.random.Generator) -> Image.Image:
    w, h = recipe.width, recipe.height
    sites = int(recipe.params.get("sites", 40))
    pts = rng.random((sites, 2)) * np.array([w, h])
    palette = np.array(_random_palette(rng, sites), dtype=np.uint8)
    yy, xx = np.mgrid[0:h, 0:w]
    coords = np.stack([xx, yy], axis=-1).astype(np.float32)
    dists = np.linalg.norm(coords[:, :, None, :] - pts[None, None, :, :], axis=-1)
    idx = np.argmin(dists, axis=-1)
    img = palette[idx]
    return Image.fromarray(img, mode="RGB")


# ---------------------------------------------------------------------------
# Helpers used by the store / CLI
# ---------------------------------------------------------------------------


def encode_image(img: Image.Image, fmt: str = "PNG") -> bytes:
    """Encode an image to bytes using the given format."""
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


def iter_recipes(
    kinds: Iterable[GeneratorKind],
    count: int,
    *,
    width: int,
    height: int,
    base_seed: int,
) -> Iterable[ImageRecipe]:
    """Yield ``count`` recipes cycling through ``kinds``."""
    kinds = list(kinds)
    if not kinds:
        raise ValueError("at least one kind is required")
    for i in range(count):
        yield ImageRecipe(
            kind=kinds[i % len(kinds)],
            width=width,
            height=height,
            seed=base_seed + i,
        )
