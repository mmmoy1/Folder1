import pytest
from PIL import Image

from vimgen.generators import (
    ImageRecipe,
    available_kinds,
    encode_image,
    generate_image,
    iter_recipes,
)


@pytest.mark.parametrize("kind", available_kinds())
def test_generate_each_kind_returns_rgb_image(kind):
    recipe = ImageRecipe(kind=kind, width=64, height=48, seed=7)
    img = generate_image(recipe)
    assert isinstance(img, Image.Image)
    assert img.mode == "RGB"
    assert img.size == (64, 48)


def test_recipe_is_deterministic():
    r = ImageRecipe(kind="gradient", width=64, height=48, seed=42)
    a = encode_image(generate_image(r))
    b = encode_image(generate_image(r))
    assert a == b


def test_recipe_fingerprint_stable_and_distinct():
    r1 = ImageRecipe(kind="noise", width=64, height=64, seed=1)
    r2 = ImageRecipe(kind="noise", width=64, height=64, seed=1)
    r3 = ImageRecipe(kind="noise", width=64, height=64, seed=2)
    assert r1.fingerprint() == r2.fingerprint()
    assert r1.fingerprint() != r3.fingerprint()


def test_recipe_rejects_bad_kind():
    with pytest.raises(ValueError):
        ImageRecipe(kind="not-a-thing")  # type: ignore[arg-type]


def test_recipe_rejects_bad_size():
    with pytest.raises(ValueError):
        ImageRecipe(kind="gradient", width=0, height=10)
    with pytest.raises(ValueError):
        ImageRecipe(kind="gradient", width=10, height=99999)


def test_iter_recipes_cycles_kinds():
    recipes = list(
        iter_recipes(
            ["gradient", "noise"], count=5, width=32, height=32, base_seed=0
        )
    )
    assert [r.kind for r in recipes] == [
        "gradient",
        "noise",
        "gradient",
        "noise",
        "gradient",
    ]
    assert [r.seed for r in recipes] == [0, 1, 2, 3, 4]


def test_iter_recipes_requires_kinds():
    with pytest.raises(ValueError):
        list(iter_recipes([], count=1, width=32, height=32, base_seed=0))
