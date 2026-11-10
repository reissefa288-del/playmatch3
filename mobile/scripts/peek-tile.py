from pathlib import Path
from PIL import Image

def show(name: str) -> None:
    image = Image.open(Path("src/features/animal-tile-match/assets/tiles") / name).convert("RGBA")
    w, h = image.size
    print("==", name)
    for y in range(6, h, 18):
        row = []
        for x in range(6, w, 22):
            r, g, b, a = image.getpixel((x, y))
            row.append(f"{r:3d},{g:3d},{b:3d}" if a > 20 else "  --  ")
        print(f"{y:3d}", " ".join(row))

for name in ["hw-card-00.png", "hw-card-02.png", "hw-card-08.png"]:
    show(name)
