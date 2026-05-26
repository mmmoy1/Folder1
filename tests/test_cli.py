import json
from pathlib import Path

from vimgen.cli import main


def test_cli_generate_writes_manifest_and_files(tmp_path, capsys):
    out = tmp_path / "drop"
    rc = main(
        [
            "generate",
            "--count", "4",
            "--width", "32",
            "--height", "32",
            "--out", str(out),
            "--kinds", "gradient", "noise",
            "--ttl", "60",
        ]
    )
    assert rc == 0
    captured = capsys.readouterr()
    summary = json.loads(captured.out)
    assert summary["count"] == 4
    manifest_path = Path(summary["manifest"])
    assert manifest_path.exists()
    data = json.loads(manifest_path.read_text())
    assert len(data["entries"]) == 4
    for entry in data["entries"]:
        assert Path(entry["uri"].replace("file://", "")).exists()


def test_cli_feed_bounded_batches(tmp_path, capsys):
    out = tmp_path / "feed"
    rc = main(
        [
            "feed",
            "--batch-size", "2",
            "--batches", "2",
            "--interval", "0",
            "--width", "32",
            "--height", "32",
            "--out", str(out),
            "--ttl", "60",
        ]
    )
    assert rc == 0
    lines = [
        json.loads(line)
        for line in capsys.readouterr().out.splitlines()
        if line.strip()
    ]
    batches = [evt for evt in lines if evt.get("event") == "batch"]
    assert len(batches) == 2
    assert all(evt["size"] == 2 for evt in batches)
    assert (out / "manifest.json").exists()


def test_cli_inspect(tmp_path, capsys):
    out = tmp_path / "drop"
    main(
        [
            "generate",
            "--count", "2",
            "--width", "32",
            "--height", "32",
            "--out", str(out),
        ]
    )
    capsys.readouterr()
    rc = main(["inspect", str(out / "manifest.json")])
    assert rc == 0
    summary = json.loads(capsys.readouterr().out)
    assert summary["entries"] == 2
