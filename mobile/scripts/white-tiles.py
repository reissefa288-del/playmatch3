"""Turn the parchment card behind each Halloween tile icon into white. Icons stay."""

from collections import deque
from pathlib import Path

from PIL import Image

SOURCE = Path("src/features/animal-tile-match/assets/tiles")
OUT = Path("src/features/deneme-2/assets/tiles")
SEED = (250, 243, 224)
LIMIT = 34


def distance(pixel: tuple[int, int, int, int]) -> float:
    return sum((pixel[channel] - SEED[channel]) ** 2 for channel in range(3)) ** 0.5


def whiten(source: Path, target: Path) -> int:
    image = Image.open(source).convert("RGBA")
    width, height = image.size
    pixels = image.load()
    seen = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()
    for y in range(height):
        for x in (0, width - 1):
            if pixels[x, y][3] > 20 and distance(pixels[x, y]) <= LIMIT:
                queue.append((x, y))
    for x in range(width):
        for y in (0, height - 1):
            if pixels[x, y][3] > 20 and distance(pixels[x, y]) <= LIMIT:
                queue.append((x, y))
    painted = 0
    while queue:
        x, y = queue.popleft()
        index = y * width + x
        if seen[index]:
            continue
        seen[index] = 1
        pixel = pixels[x, y]
        if pixel[3] < 20 or distance(pixel) > LIMIT:
            continue
        pixels[x, y] = (255, 255, 255, 255)
        painted += 1
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                queue.append((nx, ny))
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target)
    return painted


def main() -> None:
    for index in range(22):
        name = f"hw-card-{index:02d}.png"
        painted = whiten(SOURCE / name, OUT / name)
        print(name, painted)


if __name__ == "__main__":
    main()
