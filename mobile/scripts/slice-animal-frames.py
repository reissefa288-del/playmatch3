"""Punch neon frames and slice them into corners and edges."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

SRC = Path(r"C:\Users\farec\.cursor\projects\c-Users-farec-Desktop-PlayMeet\assets")
OUT = Path(r"C:\Users\farec\Desktop\PlayMeet\mobile\src\features\animal-tile-match\assets\ui")


def dark(r: int, g: int, b: int, limit: int) -> bool:
    return max(r, g, b) <= limit


def flood(pix, w: int, h: int, seeds: list[tuple[int, int]], limit: int) -> set[tuple[int, int]]:
    seen: set[tuple[int, int]] = set()
    q: deque[tuple[int, int]] = deque()
    for x, y in seeds:
        if 0 <= x < w and 0 <= y < h and (x, y) not in seen and dark(*pix[x, y][:3], limit):
            seen.add((x, y))
            q.append((x, y))
    while q:
        x, y = q.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if nx < 0 or ny < 0 or nx >= w or ny >= h or (nx, ny) in seen:
                continue
            if dark(*pix[nx, ny][:3], limit):
                seen.add((nx, ny))
                q.append((nx, ny))
    return seen


def punch(src: Path) -> Image.Image:
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    pix = im.load()
    step = max(1, min(w, h) // 80)
    edges = [(x, 0) for x in range(0, w, step)] + [(x, h - 1) for x in range(0, w, step)]
    edges += [(0, y) for y in range(0, h, step)] + [(w - 1, y) for y in range(0, h, step)]
    kill = flood(pix, w, h, edges, 24)
    kill |= flood(pix, w, h, [(w // 2, h // 2)], 24)
    for x, y in kill:
        r, g, b, _a = pix[x, y]
        pix[x, y] = (r, g, b, 0)
    bbox = im.getbbox()
    if not bbox:
        raise SystemExit(f"empty frame: {src}")
    pad = 2
    return im.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(w, bbox[2] + pad), min(h, bbox[3] + pad)))


def slice_frame(im: Image.Image, tone: str) -> None:
    w, h = im.size
    corner = int(min(w, h) * 0.22)
    boxes = {
        "tl": (0, 0, corner, corner),
        "t": (corner, 0, w - corner, corner),
        "tr": (w - corner, 0, w, corner),
        "l": (0, corner, corner, h - corner),
        "r": (w - corner, corner, w, h - corner),
        "bl": (0, h - corner, corner, h),
        "b": (corner, h - corner, w - corner, h),
        "br": (w - corner, h - corner, w, h),
    }
    for key, box in boxes.items():
        piece = im.crop(box)
        dest = OUT / f"frame-{tone}-{key}.png"
        piece.save(dest)
        print(f"{dest.name} {piece.size[0]}x{piece.size[1]}")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    slice_frame(punch(SRC / "atm-frame-pink.jpg"), "pink")
    slice_frame(punch(SRC / "atm-frame-blue.jpg"), "blue")
    vs = punch(SRC / "atm-vs.jpg")
    vs.save(OUT / "vs-emblem.png")
    print(f"vs-emblem.png {vs.size[0]}x{vs.size[1]}")


if __name__ == "__main__":
    main()
