import re
from collections import Counter
from pathlib import Path

root = Path(r"c:\Users\farec\Desktop\PlayMeet\mobile\src\features\galaxy-duel\assets\game")
catalog = Path(r"c:\Users\farec\Desktop\PlayMeet\mobile\src\features\galaxy-duel\game-catalog.ts")
counts = Counter(path.name for path in root.rglob("*.png"))
print("dups", [name for name, count in counts.items() if count > 1])
text = catalog.read_text(encoding="utf-8")
missing = []
for rel in re.findall(r'require\("\./assets/game/([^"]+)"\)', text):
    if not (root / rel).exists():
        missing.append(rel)
print("missing", len(missing))
for rel in missing[:15]:
    print(rel)
