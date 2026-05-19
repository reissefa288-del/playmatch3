import json
import shutil
import urllib.parse
from pathlib import Path

HISTORY_ROOT = Path(r"c:\Users\farec\AppData\Roaming\Cursor\User\History")
WORKSPACE = Path(r"c:\Users\farec\Desktop\PlayMeet").resolve()


def main() -> None:
    restored = 0
    for entries_path in HISTORY_ROOT.rglob("entries.json"):
        try:
            data = json.loads(entries_path.read_text(encoding="utf-8"))
        except Exception:
            continue

        resource = data.get("resource", "")
        if not resource.startswith("file:///"):
            continue

        decoded = urllib.parse.unquote(resource.replace("file:///", ""))
        target = Path(decoded)
        try:
            target = target.resolve()
        except Exception:
            continue

        if WORKSPACE not in target.parents and target != WORKSPACE:
            continue

        try:
            rel = target.relative_to(WORKSPACE).as_posix()
        except ValueError:
            continue

        if not rel.startswith("src/"):
            continue

        entries = data.get("entries", [])
        if not entries:
            continue

        best = max(entries, key=lambda e: e.get("timestamp", 0))
        snap_id = best.get("id")
        if not isinstance(snap_id, str):
            continue

        snapshot = entries_path.parent / snap_id
        if not snapshot.exists():
            continue

        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(snapshot, target)
        restored += 1

    print(f"restored_files={restored}")


if __name__ == "__main__":
    main()
