import time

import pytest

from vimgen.store import VolatileStore


def _payload(n: int = 64) -> bytes:
    return b"\x00\x01\x02\x03" * (n // 4)


def test_put_get_read_roundtrip(tmp_path):
    store = VolatileStore(root=tmp_path, persistent=True)
    data = _payload(128)
    asset = store.put("alpha", data, kind="noise")
    assert asset.size_bytes == len(data)
    assert asset.path.exists()
    assert store.get("alpha") is asset
    assert store.read("alpha") == data
    assert len(store) == 1


def test_expired_assets_are_evicted(tmp_path):
    store = VolatileStore(root=tmp_path, ttl_seconds=0.05, persistent=True)
    store.put("temp", _payload(), kind="noise")
    assert len(store) == 1
    time.sleep(0.1)
    assert len(store) == 0
    assert store.get("temp") is None


def test_max_assets_budget_evicts_oldest(tmp_path):
    store = VolatileStore(
        root=tmp_path,
        ttl_seconds=60,
        max_assets=2,
        persistent=True,
    )
    a1 = store.put("a", _payload(), kind="noise")
    a2 = store.put("b", _payload(), kind="noise")
    a3 = store.put("c", _payload(), kind="noise")
    live = {a.asset_id for a in store.list_live()}
    assert a1.asset_id not in live
    assert a2.asset_id in live
    assert a3.asset_id in live


def test_max_bytes_budget_evicts_oldest(tmp_path):
    store = VolatileStore(
        root=tmp_path,
        ttl_seconds=60,
        max_bytes=200,
        persistent=True,
    )
    store.put("a", _payload(128), kind="noise")
    store.put("b", _payload(128), kind="noise")
    assert store.total_bytes() <= 200
    ids = {a.asset_id for a in store.list_live()}
    assert "b" in ids


def test_close_wipes_owned_tempdir():
    store = VolatileStore()
    root = store.root
    store.put("x", _payload(), kind="noise")
    assert root.exists()
    store.close()
    assert not root.exists()


def test_persistent_store_survives_close(tmp_path):
    store = VolatileStore(root=tmp_path, persistent=True)
    store.put("x", _payload(), kind="noise")
    store.close()
    assert tmp_path.exists()


def test_put_rejects_bad_asset_id(tmp_path):
    store = VolatileStore(root=tmp_path, persistent=True)
    with pytest.raises(ValueError):
        store.put("a/b", _payload(), kind="noise")
    with pytest.raises(ValueError):
        store.put("", _payload(), kind="noise")


def test_context_manager_cleans_up():
    with VolatileStore() as store:
        root = store.root
        store.put("x", _payload(), kind="noise")
        assert root.exists()
    assert not root.exists()
