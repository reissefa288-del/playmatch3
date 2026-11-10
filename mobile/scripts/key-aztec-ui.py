"""Chroma-key generated Aztec UI plates into transparent PNGs and 9-slice the board frame."""

from pathlib import Path

import numpy as np
from PIL import Image

SRC = Path(r"C:\Users\farec\.cursor\projects\c-Users-farec-Desktop-PlayMeet\assets")
OUT = Path(r"c:\Users\farec\Desktop\PlayMeet\mobile\src\features\aztec-match\assets\aztec-ui")


def key_image(path: Path) -> Image.Image:
    rgb = np.asarray(Image.open(path).convert("RGB")).astype(np.int16)
    height, width, _ = rgb.shape
    corner = rgb[2, 2]
    dist = np.abs(rgb - corner).sum(axis=2)
    red, green, blue = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    magenta = (red > 150) & (blue > 80) & (green < 100) & (red > green + 40) & (blue > green + 30)
    bg = (dist < 90) | magenta
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    # Soften the fringe: pixels near the key lose a little magenta.
    fringe = (dist < 140) & (alpha == 255)
    out = np.zeros((height, width, 4), dtype=np.uint8)
    out[:, :, :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    out[:, :, 3] = alpha
    out[fringe, 0] = (out[fringe, 0] * 0.85).astype(np.uint8)
    out[fringe, 2] = (out[fringe, 2] * 0.85).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def crop_content(image: Image.Image, pad: int = 8) -> Image.Image:
    alpha = np.asarray(image)[:, :, 3]
    ys, xs = np.where(alpha > 16)
    if len(xs) == 0:
        return image
    left = max(int(xs.min()) - pad, 0)
    top = max(int(ys.min()) - pad, 0)
    right = min(int(xs.max()) + pad + 1, image.width)
    bottom = min(int(ys.max()) + pad + 1, image.height)
    return image.crop((left, top, right, bottom))


def slice_frame(image: Image.Image, folder: Path) -> None:
    alpha = np.asarray(image)[:, :, 3]
    height, width = alpha.shape
    mid_x = width // 2
    mid_y = height // 2
    # Border thickness: walk inward from the content until the hole.
    top = 0
    while top < height and alpha[top, mid_x] < 16:
        top += 1
    border_top = top
    while border_top < height and alpha[border_top, mid_x] > 16:
        border_top += 1
    thickness = max(border_top - top, int(min(width, height) * 0.12))
    thickness = min(thickness, int(min(width, height) * 0.22))
    corner = thickness
    pieces = {
        "corner-tl": (0, 0, corner, corner),
        "corner-tr": (width - corner, 0, width, corner),
        "corner-bl": (0, height - corner, corner, height),
        "corner-br": (width - corner, height - corner, width, height),
        "edge-t": (corner, 0, width - corner, corner),
        "edge-b": (corner, height - corner, width - corner, height),
        "edge-l": (0, corner, corner, height - corner),
        "edge-r": (width - corner, corner, width, height - corner),
    }
    folder.mkdir(parents=True, exist_ok=True)
    image.save(folder / "frame.png")
    for name, box in pieces.items():
        image.crop(box).save(folder / f"{name}.png")
    print("frame corner", corner, "size", image.size)


def save(image: Image.Image, path: Path, max_w: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if image.width > max_w:
        height = max(1, round(image.height * max_w / image.width))
        image = image.resize((max_w, height), Image.Resampling.LANCZOS)
    image.save(path)
    print(path.name, image.size)


def main() -> None:
    frame = crop_content(key_image(SRC / "aztec-board-frame.jpg"), 2)
    slice_frame(frame, OUT / "frames")

    save(crop_content(key_image(SRC / "aztec-side-rail.jpg")), OUT / "side-holders" / "rail.png", 280)
    save(crop_content(key_image(SRC / "aztec-divider.jpg")), OUT / "dividers" / "divider.png", 1200)
    save(crop_content(key_image(SRC / "aztec-tray.jpg")), OUT / "collection-tray" / "tray.png", 1280)
    save(crop_content(key_image(SRC / "aztec-score-panel.jpg")), OUT / "hud" / "score.png", 720)
    save(crop_content(key_image(SRC / "aztec-timer-panel.jpg")), OUT / "hud" / "timer.png", 840)
    save(crop_content(key_image(SRC / "aztec-player-cool.jpg")), OUT / "hud" / "player-cool.png", 900)
    save(crop_content(key_image(SRC / "aztec-player-warm.jpg")), OUT / "hud" / "player-warm.png", 900)

    divider = Image.open(OUT / "dividers" / "divider.png")
    medal = divider.crop(
        (
            int(divider.width * 0.38),
            int(divider.height * 0.15),
            int(divider.width * 0.62),
            int(divider.height * 0.85),
        )
    )
    save(medal, OUT / "ornaments" / "sun-medallion.png", 320)


if __name__ == "__main__":
    main()
