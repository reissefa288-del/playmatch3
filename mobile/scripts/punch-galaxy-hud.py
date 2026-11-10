"""Punch near-black backgrounds out of Galaxy Duel HUD plates and save PNGs."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

SRC = Path(r"C:\Users\farec\.cursor\projects\c-Users-farec-Desktop-PlayMeet\assets")
OUT = Path(r"C:\Users\farec\Desktop\PlayMeet\mobile\src\features\galaxy-duel\assets\ui")

# name, source, dest relative to OUT, also punch the enclosed center hole
JOBS = [
    ("frame", "gd-frame.jpg", "frame/frame.png", True),
    ("hud-red", "gd-hud-red-empty.jpg", "player-red/hud.png", False),
    ("hud-blue", "gd-hud-blue-empty.jpg", "player-blue/hud.png", False),
    ("timer", "gd-timer.jpg", "timer/timer.png", False),
    ("score-red", "gd-score-red.jpg", "score/score-red.png", False),
    ("score-blue", "gd-score-blue.jpg", "score/score-blue.png", False),
    ("health-red", "gd-health-red.jpg", "health/health-red.png", True),
    ("health-blue", "gd-health-blue.jpg", "health/health-blue.png", True),
    ("vs", "gd-vs.jpg", "vs/divider.png", False),
    ("badge", "gd-vs-badge.jpg", "vs/badge.png", False),
    ("slot-red", "gd-slot-red.jpg", "ability-slots/slot-red.png", False),
    ("slot-blue", "gd-slot-blue.jpg", "ability-slots/slot-blue.png", False),
    ("ship-red", "gd-ship-red.jpg", "player-red/ship.png", False),
    ("ship-blue", "gd-ship-blue.jpg", "player-blue/ship.png", False),
]


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


def edge_seeds(w: int, h: int) -> list[tuple[int, int]]:
    seeds = []
    step = max(1, min(w, h) // 80)
    for x in range(0, w, step):
        seeds.append((x, 0))
        seeds.append((x, h - 1))
    for y in range(0, h, step):
        seeds.append((0, y))
        seeds.append((w - 1, y))
    return seeds


def punch(src: Path, hole: bool) -> Image.Image:
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    pix = im.load()
    kill = flood(pix, w, h, edge_seeds(w, h), 22)
    if hole:
        cx, cy = w // 2, h // 2
        if dark(*pix[cx, cy][:3], 36):
            kill |= flood(pix, w, h, [(cx, cy)], 32)
    # Soften the cut so neon rims keep a thin dark lip.
    for x, y in kill:
        r, g, b, _a = pix[x, y]
        pix[x, y] = (r, g, b, 0)
    # Feather pixels that touch transparency and are still very dark.
    extra = []
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a == 0 or max(r, g, b) > 40:
                continue
            if any(
                pix[nx, ny][3] == 0
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))
                if 0 <= nx < w and 0 <= ny < h
            ):
                extra.append((x, y))
    for x, y in extra:
        r, g, b, _a = pix[x, y]
        pix[x, y] = (r, g, b, 0)
    bbox = im.getbbox()
    if bbox:
        pad = 2
        l, t, r, b = bbox
        im = im.crop((max(0, l - pad), max(0, t - pad), min(w, r + pad), min(h, b + pad)))
    return im


def main() -> None:
    for name, src_name, dest_rel, hole in JOBS:
        src = SRC / src_name
        im = Image.open(src).convert("RGB")
        w, h = im.size
        px = im.load()
        print(
            f"{name:12} {w}x{h} corner={px[2, 2]} center={px[w // 2, h // 2]} midedge={px[w // 2, 4]}"
        )
        out = punch(src, hole)
        dest = OUT / dest_rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        out.save(dest, "PNG")
        alpha = out.getchannel("A")
        hist = alpha.histogram()
        transparent = hist[0]
        opaque = hist[255]
        print(f"  -> {dest_rel} {out.size[0]}x{out.size[1]} clear={transparent} solid={opaque}")


if __name__ == "__main__":
    main()
