"""Split black-background icon sheets into cropped transparent PNGs."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

SRC = Path(r"C:\Users\farec\.cursor\projects\c-Users-farec-Desktop-PlayMeet\assets")
OUT = Path(r"C:\Users\farec\Desktop\PlayMeet\mobile\src\features\animal-tile-match\assets")

SHEETS: list[tuple[str, int, int, list[str]]] = [
    (
        "atm-sheet-a.jpg",
        3,
        2,
        ["fox", "penguin", "clover", "rabbit", "bear", "owl"],
    ),
    (
        "atm-sheet-b.jpg",
        3,
        2,
        ["whale", "strawberry", "frog", "leaf", "mushroom", "star"],
    ),
    (
        "atm-sheet-c.jpg",
        3,
        2,
        ["turtle", "squirrel", "carrot", "pig", "panda", "acorn"],
    ),
    (
        "atm-sheet-d.jpg",
        2,
        2,
        ["bee", "cherries", "cat", "moon"],
    ),
]


def punch(cell: Image.Image) -> Image.Image:
    im = cell.convert("RGBA")
    pix = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if max(r, g, b) <= 28:
                pix[x, y] = (r, g, b, 0)
    return im


def to_square(im: Image.Image) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        raise SystemExit("empty cell")
    cropped = im.crop(bbox)
    side = max(cropped.size) + 24
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(cropped, ((side - cropped.size[0]) // 2, (side - cropped.size[1]) // 2), cropped)
    return canvas


def main() -> None:
    tiles = OUT / "tiles"
    tiles.mkdir(parents=True, exist_ok=True)
    for name, cols, rows, labels in SHEETS:
        sheet = Image.open(SRC / name)
        w, h = sheet.size
        cw, ch = w // cols, h // rows
        for index, label in enumerate(labels):
            col, row = index % cols, index // cols
            cell = sheet.crop((col * cw, row * ch, (col + 1) * cw if col < cols - 1 else w, (row + 1) * ch if row < rows - 1 else h))
            icon = to_square(punch(cell))
            dest = tiles / f"tile-{label}.png"
            icon.save(dest)
            print(f"{dest.name} {icon.size[0]}x{icon.size[1]}")

    avatars = OUT / "avatars"
    avatars.mkdir(parents=True, exist_ok=True)
    for src_name, dest_name in (("atm-avatar-maya.jpg", "avatar-maya.png"), ("atm-avatar-berk.jpg", "avatar-berk.png")):
        face = to_square(punch(Image.open(SRC / src_name)))
        face.save(avatars / dest_name)
        print(f"{dest_name} {face.size[0]}x{face.size[1]}")


if __name__ == "__main__":
    main()
