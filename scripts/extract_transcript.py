import json
import re
from pathlib import Path

TRANSCRIPT = Path(
    r"C:\Users\farec\.cursor\projects\c-Users-farec-Desktop-PlayMeet\agent-transcripts"
    r"\eda2e469-30bd-434b-ab6f-4d68e3329eac\eda2e469-30bd-434b-ab6f-4d68e3329eac.jsonl"
)
BASE = Path(r"c:\Users\farec\Desktop\PlayMeet")

TARGETS = [
    "HomeScreen.tsx",
    "FilterBar.tsx",
    "NearbyPlayerCard.tsx",
    "QuestCard.tsx",
    "QuickStartSection.tsx",
    "types.ts",
    "CategoryTabs.tsx",
    "Navbar.tsx",
    "HeroPlayerCard.tsx",
    "data.ts",
    "games.css",
]


def norm(p: str) -> str:
    p = p.replace("\\\\", "/").replace("\\", "/")
    if "PlayMeet/" in p:
        return p.split("PlayMeet/", 1)[1]
    return p


def parse_add_patch(patch: str) -> tuple[str, str] | tuple[None, None]:
    if "*** Add File:" not in patch:
        return None, None
    lines = patch.splitlines()
    path = norm(lines[0].replace("*** Add File:", "").strip())
    content: list[str] = []
    for line in lines[1:]:
        if line.startswith("***"):
            break
        if line.startswith("+") and not line.startswith("+++"):
            content.append(line[1:])
    return path, "\n".join(content)


def best_versions() -> dict[str, str]:
    versions: dict[str, str] = {}

    for line in TRANSCRIPT.read_text(encoding="utf-8").splitlines():
        obj = json.loads(line)
        for block in obj.get("message", {}).get("content", []):
            name = block.get("name", "")
            inp = block.get("input")

            if name == "Write" and isinstance(inp, dict) and "path" in inp:
                path = norm(inp["path"])
                content = inp.get("contents", "")
                if any(t in path for t in TARGETS) or path.endswith(
                    tuple(f"home/{t}" for t in TARGETS)
                ):
                    if len(content) > len(versions.get(path, "")):
                        versions[path] = content

            if name == "ApplyPatch" and isinstance(inp, str):
                path, content = parse_add_patch(inp)
                if path and any(t in path for t in TARGETS):
                    if len(content) > len(versions.get(path, "")):
                        versions[path] = content

    return versions


def main() -> None:
    versions = best_versions()
    for path, content in sorted(versions.items()):
        rel = norm(path)
        print(f"{rel}: {len(content)} chars")
        if not rel.startswith("src/"):
            continue
        out = BASE / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(content, encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
