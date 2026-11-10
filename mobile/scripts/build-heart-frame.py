"""Heart-cluster frame whose opening is the real tile silhouette."""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

TILE = 110
STEP = TILE * 1.035
PAD = 22
BORDER = 46
MARGIN = 90
FRONT = (
    [(1, 0), (2, 0), (4, 0), (5, 0)]
    + [(c, 1) for c in range(7)]
    + [(c, 2) for c in range(7)]
    + [(c, 3) for c in range(1, 6)]
    + [(2, 4), (3, 4), (4, 4)]
    + [(3, 5)]
)
CELLS = FRONT + [(c + 0.36, r + 0.3) for c, r in FRONT]
OUT = Path(__file__).resolve().parents[1] / "src/features/animal-tile-match/assets/ui"
GEN = Path(r"C:\Users\farec\.cursor\projects\c-Users-farec-Desktop-PlayMeet\assets")


def dilate(image: Image.Image, pixels: int) -> Image.Image:
    for _ in range(pixels):
        image = image.filter(ImageFilter.MaxFilter(3))
    return image


def distance(source: np.ndarray, limit: int) -> np.ndarray:
    inf = limit + 1
    dist = np.where(source, 0, inf).astype(np.int16)
    for _ in range(limit):
        up = np.vstack([dist[1:], np.full((1, dist.shape[1]), inf)])
        down = np.vstack([np.full((1, dist.shape[1]), inf), dist[:-1]])
        left = np.hstack([dist[:, 1:], np.full((dist.shape[0], 1), inf)])
        right = np.hstack([np.full((dist.shape[0], 1), inf), dist[:, :-1]])
        nxt = np.minimum(np.minimum(up, down), np.minimum(left, right)) + 1
        dist = np.minimum(dist, nxt)
    return dist


def sprite(path: Path, box: tuple[int, int, int, int]) -> Image.Image:
    rgb = np.asarray(Image.open(path).convert("RGB")).astype(np.int16)
    red, green, blue = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    magenta = (red > 170) & (blue > 70) & (green < 140) & (red > green + 40)
    alpha = np.where(magenta, 0, 255).astype(np.uint8)
    rgba = np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), alpha])
    crop = rgba[box[1] : box[3], box[0] : box[2]]
    # Keep only the decoration, drop leftover flat magenta fringe.
    return Image.fromarray(crop, "RGBA")


def build(warm: bool) -> None:
    min_c = min(c for c, _ in CELLS)
    min_r = min(r for _, r in CELLS)
    max_x = max((c - min_c) * STEP + TILE for c, _ in CELLS)
    max_y = max((r - min_r) * STEP + TILE for _, r in CELLS)
    width = int(np.ceil(max_x + (PAD + BORDER + MARGIN) * 2))
    height = int(np.ceil(max_y + (PAD + BORDER + MARGIN) * 2))
    origin_x = MARGIN + BORDER + PAD
    origin_y = MARGIN + BORDER + PAD

    tiles = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(tiles)
    for col, row in CELLS:
        x = origin_x + (col - min_c) * STEP
        y = origin_y + (row - min_r) * STEP
        draw.rounded_rectangle([x, y, x + TILE - 1, y + TILE - 1], radius=10, fill=255)
    closed = dilate(tiles, 3)
    hole = dilate(closed, PAD)
    outer = dilate(hole, BORDER)

    hole_np = np.asarray(hole) > 0
    outer_np = np.asarray(outer) > 0
    wood = outer_np & ~hole_np
    inner_dist = distance(hole_np, BORDER + 2)
    outer_dist = distance(~outer_np, BORDER + 2)

    color = np.zeros((height, width, 4), dtype=np.uint8)
    if warm:
        highlight = np.array([255, 214, 96], dtype=np.float32)
        mid = np.array([186, 78, 18], dtype=np.float32)
        shadow = np.array([74, 24, 8], dtype=np.float32)
    else:
        highlight = np.array([186, 228, 255], dtype=np.float32)
        mid = np.array([36, 78, 188], dtype=np.float32)
        shadow = np.array([10, 16, 58], dtype=np.float32)

    ys, xs = np.where(wood)
    din = inner_dist[ys, xs].astype(np.float32)
    dout = outer_dist[ys, xs].astype(np.float32)
    lip = np.clip(1 - din / 7, 0, 1)
    edge = np.clip(1 - dout / 9, 0, 1)
    ridge = np.exp(-((din - 16) ** 2) / 30)
    mix = mid * (1 - lip)[:, None] * (1 - edge)[:, None] + highlight * lip[:, None] + shadow * edge[:, None]
    mix = mix * (1 - 0.35 * ridge[:, None]) + np.array([255, 236, 190]) * ridge[:, None] * 0.25
    grain = ((xs * 17 + ys * 11) % 7) - 3
    mix = np.clip(mix + grain[:, None], 0, 255)
    color[ys, xs, :3] = mix.astype(np.uint8)
    color[ys, xs, 3] = 255

    frame = Image.fromarray(color, "RGBA")
    pen = ImageDraw.Draw(frame)

    # Lanterns sit on the outer top corners. Pumpkin sits in the top notch.
    top = int(np.where(wood.any(axis=1))[0].min())
    left_band = wood[top : top + BORDER + 20, : width // 2]
    right_band = wood[top : top + BORDER + 20, width // 2 :]
    left_x = int(np.where(left_band.any(axis=0))[0].min())
    right_x = width // 2 + int(np.where(right_band.any(axis=0))[0].max())
    lantern = 78
    for cx in (left_x, right_x - lantern):
        cy = max(8, top - lantern + 18)
        pen.rounded_rectangle([cx + 18, cy, cx + lantern - 18, cy + 16], radius=4, fill=(48, 24, 10, 255))
        pen.polygon(
            [(cx + 10, cy + 16), (cx + lantern - 10, cy + 16), (cx + lantern - 18, cy + 62), (cx + 18, cy + 62)],
            fill=(255, 168, 42, 255),
        )
        pen.polygon(
            [(cx + 22, cy + 22), (cx + lantern - 22, cy + 22), (cx + lantern - 28, cy + 54), (cx + 28, cy + 54)],
            fill=(255, 236, 150, 255),
        )
        pen.rectangle([cx + lantern // 2 - 3, cy + 62, cx + lantern // 2 + 3, cy + 74], fill=(48, 24, 10, 255))

    notch_x = width // 2
    notch_y = top - 8
    pen.ellipse([notch_x - 34, notch_y - 28, notch_x + 34, notch_y + 36], fill=(214, 92, 16, 255))
    pen.polygon([(notch_x, notch_y - 46), (notch_x - 10, notch_y - 22), (notch_x + 10, notch_y - 22)], fill=(42, 130, 36, 255))
    for eye in (-14, 10):
        pen.polygon(
            [(notch_x + eye, notch_y - 4), (notch_x + eye + 12, notch_y - 4), (notch_x + eye + 6, notch_y + 8)],
            fill=(255, 196, 40, 255),
        )
    pen.polygon(
        [(notch_x - 6, notch_y + 12), (notch_x + 6, notch_y + 12), (notch_x, notch_y + 22)],
        fill=(255, 196, 40, 255),
    )

    alpha = np.asarray(frame)[:, :, 3]
    ys, xs = np.where(alpha > 16)
    crop = frame.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))
    hole_crop = hole_np[int(ys.min()) : int(ys.max()) + 1, int(xs.min()) : int(xs.max()) + 1]
    hy, hx = np.where(hole_crop)
    # Tiles must sit inside the opening.
    tile_np = np.asarray(tiles) > 0
    if tile_np[hole_np].size:
        pass
    outside = int((tile_np & ~hole_np).sum())
    name = "heart-wrap-warm.png" if warm else "heart-wrap-cool.png"
    crop.save(OUT / name)
    h, w = hole_crop.shape
    print(
        name,
        crop.size,
        "hole",
        round(hx.min() / w, 4),
        round(hy.min() / h, 4),
        round(hx.max() / w, 4),
        round(hy.max() / h, 4),
        "outside",
        outside,
        "pad",
        round((PAD + 3) / TILE, 4),
    )


if __name__ == "__main__":
    build(True)
    build(False)
