"""Turn generated black-background sprites into cropped transparent PNGs."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

SRC = Path(r"C:\Users\farec\.cursor\projects\c-Users-farec-Desktop-PlayMeet\assets")
OUT = Path(r"C:\Users\farec\Desktop\PlayMeet\mobile\src\features\galaxy-duel\assets\game")

JOBS: list[tuple[str, str, bool]] = [
    ("gd-player-blue.jpg", "players/player-1-blue.png", True),
    ("gd-player-red.jpg", "players/player-2-red.png", True),
    ("gd-enemy-scout.jpg", "enemies/enemy-01-scout.png", False),
    ("gd-enemy-fighter.jpg", "enemies/enemy-02-fighter.png", False),
    ("gd-enemy-heavy.jpg", "enemies/enemy-03-heavy.png", False),
    ("gd-enemy-hunter.jpg", "enemies/enemy-04-hunter.png", False),
    ("gd-enemy-bomber.jpg", "enemies/enemy-05-tank.png", False),
    ("gd-enemy-sniper.jpg", "enemies/enemy-06-sniper.png", False),
    ("gd-enemy-elite.jpg", "enemies/enemy-07-elite.png", False),
    ("gd-shot-blue.jpg", "projectiles/projectile-blue-laser.png", False),
    ("gd-shot-blue.jpg", "projectiles/projectile-twin-laser.png", False),
    ("gd-shot-blue.jpg", "projectiles/projectile-triple-shot.png", False),
    ("gd-shot-red.jpg", "projectiles/projectile-red-laser.png", False),
    ("gd-shot-orb.jpg", "projectiles/projectile-plasma-orb.png", False),
    ("gd-shot-beam-blue.jpg", "projectiles/projectile-energy-wave.png", False),
    ("gd-shot-piercer.jpg", "projectiles/projectile-piercer.png", False),
    ("gd-shot-beam-red.jpg", "projectiles/projectile-super.png", False),
    ("gd-shot-enemy.jpg", "projectiles/projectile-enemy-bolt.png", False),
]


def dark(r: int, g: int, b: int, limit: int) -> bool:
    return max(r, g, b) <= limit


def flood(pix, w: int, h: int, limit: int) -> set[tuple[int, int]]:
    seen: set[tuple[int, int]] = set()
    q: deque[tuple[int, int]] = deque()
    step = max(1, min(w, h) // 90)
    seeds = [(x, 0) for x in range(0, w, step)] + [(x, h - 1) for x in range(0, w, step)]
    seeds += [(0, y) for y in range(0, h, step)] + [(w - 1, y) for y in range(0, h, step)]
    for x, y in seeds:
        if (x, y) not in seen and dark(*pix[x, y][:3], limit):
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
    kill = flood(pix, w, h, 26)
    for x, y in kill:
        r, g, b, _a = pix[x, y]
        pix[x, y] = (r, g, b, 0)
    bbox = im.getbbox()
    if not bbox:
        raise SystemExit(f"empty sprite: {src}")
    pad = 8
    left = max(0, bbox[0] - pad)
    top = max(0, bbox[1] - pad)
    right = min(w, bbox[2] + pad)
    bottom = min(h, bbox[3] + pad)
    return im.crop((left, top, right, bottom))


def flash(im: Image.Image) -> Image.Image:
    out = im.copy()
    pix = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a == 0:
                continue
            pix[x, y] = (min(255, r + 110), min(255, int(g * 0.55 + 40)), min(255, int(b * 0.55 + 40)), a)
    return out


def main() -> None:
    for name, rel, make_hit in JOBS:
        image = punch(SRC / name)
        dest = OUT / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        image.save(dest)
        print(f"{rel} {image.size[0]}x{image.size[1]}")
        if make_hit:
            hit = dest.with_name(dest.stem + "-hit.png")
            flash(image).save(hit)
            print(f"{hit.name} {image.size[0]}x{image.size[1]}")


if __name__ == "__main__":
    main()
