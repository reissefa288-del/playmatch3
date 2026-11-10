"""Cut the 7-slot trays and the Halloween card faces from the reference photos."""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
UI = ROOT / "src/features/animal-tile-match/assets/ui"
TILES = ROOT / "src/features/animal-tile-match/assets/tiles"
ASSETS = Path(r"C:\Users\farec\.cursor\projects\c-Users-farec-Desktop-PlayMeet\assets")
TRAY_SRC = ASSETS / "WhatsApp_Image_2026-11-02_at_13.11.32__2_-8c09a80a-6ef5-45da-8e16-645a84d5d8b3.jpg"
CARD_SRC = ASSETS / "WhatsApp_Image_2026-11-02_at_13.57.15__1_-109583d6-2b64-47b8-9202-6eaae0c727b2.jpg"


def key_black(rgb: np.ndarray, limit: int = 22) -> np.ndarray:
    color = np.clip(rgb, 0, 255).astype(np.uint8)
    dark = rgb.max(axis=2) < limit
    alpha = np.where(dark, 0, 255).astype(np.uint8)
    out = np.dstack([color, alpha])
    out[dark, :3] = 0
    return out


def crop_alpha(rgba: np.ndarray) -> np.ndarray:
    ys, xs = np.where(rgba[:, :, 3] > 16)
    return rgba[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1]


def bands(mask: np.ndarray) -> list[tuple[int, int]]:
    rows = np.where(mask.any(axis=1))[0]
    groups: list[tuple[int, int]] = []
    start = int(rows[0])
    prev = int(rows[0])
    for row in rows[1:]:
        row = int(row)
        if row > prev + 8:
            groups.append((start, prev))
            start = row
        prev = row
    groups.append((start, prev))
    return groups


def slots_of(rgba: np.ndarray) -> list[tuple[float, float, float, float]]:
    rgb = rgba[:, :, :3].astype(np.int16)
    alpha = rgba[:, :, 3] > 16
    dark = alpha & (rgb.max(axis=2) < 48)
    height, width = dark.shape
    row = dark[int(height * 0.42) : int(height * 0.72)].any(axis=0)
    runs: list[tuple[int, int]] = []
    start = None
    for x, on in enumerate(row):
        if on and start is None:
            start = x
        elif not on and start is not None:
            if x - start > width * 0.04:
                runs.append((start, x - 1))
            start = None
    if start is not None and width - start > width * 0.04:
        runs.append((start, width - 1))
    rects = []
    for x0, x1 in runs:
        col = dark[:, x0 : x1 + 1].any(axis=1)
        ys = np.where(col)[0]
        if len(ys) == 0:
            continue
        rects.append((x0 / width, ys.min() / height, (x1 + 1) / width, (ys.max() + 1) / height))
    return rects


def cut_trays() -> None:
    rgb = np.asarray(Image.open(TRAY_SRC).convert("RGB")).astype(np.int16)
    content = rgb.max(axis=2) > 22
    for index, (y0, y1) in enumerate(bands(content)):
        piece = crop_alpha(key_black(rgb[y0 : y1 + 1]))
        name = "tray-slot-warm.png" if index == 0 else "tray-slot-cool.png"
        Image.fromarray(piece, "RGBA").save(UI / name)
        found = slots_of(piece)
        print(name, piece.shape[1], piece.shape[0], "slots", len(found))
        for slot in found:
            print(" ", " ".join(f"{value:.4f}" for value in slot))


def components(mask: np.ndarray) -> list[tuple[int, int, int, int]]:
    height, width = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    found: list[tuple[int, int, int, int]] = []
    for y in range(height):
        xs = np.where(mask[y] & ~seen[y])[0]
        for x in xs:
            stack = [(int(x), y)]
            seen[y, x] = True
            minx = maxx = int(x)
            miny = maxy = y
            count = 0
            while stack:
                cx, cy = stack.pop()
                count += 1
                minx, maxx = min(minx, cx), max(maxx, cx)
                miny, maxy = min(miny, cy), max(maxy, cy)
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if 0 <= nx < width and 0 <= ny < height and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((nx, ny))
            if count > 400:
                found.append((minx, miny, maxx, maxy))
    found.sort(key=lambda box: (box[1] // 40, box[0]))
    return found


def cut_cards() -> None:
    rgb = np.asarray(Image.open(CARD_SRC).convert("RGB")).astype(np.int16)
    red, green, blue = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    beige = (red > 150) & (green > 110) & (blue < 170) & (red > blue + 25) & (green > blue)
    boxes = components(beige)
    # Drop the caption plaque: it sits alone on the bottom and is much wider than a card.
    widths = [box[2] - box[0] for box in boxes]
    typical = float(np.median(widths))
    cards = [box for box in boxes if (box[2] - box[0]) < typical * 1.6]
    print("cards", len(cards), "typical", round(typical, 1))
    for index, (x0, y0, x1, y1) in enumerate(cards):
        pad = 2
        crop = rgb[max(0, y0 - pad) : y1 + 1 + pad, max(0, x0 - pad) : x1 + 1 + pad]
        piece = crop_alpha(key_black(crop, 18))
        Image.fromarray(piece, "RGBA").save(TILES / f"hw-card-{index:02d}.png")
        print(index, piece.shape[1], piece.shape[0])


if __name__ == "__main__":
    cut_trays()
    cut_cards()
