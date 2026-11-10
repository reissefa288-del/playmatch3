from pathlib import Path

from PIL import Image

source = Path(
    r"C:\Users\farec\.cursor\projects\c-Users-farec-Desktop-PlayMeet\assets\WhatsApp_Image_2026-11-03_at_17.26.22__1_-a60c3988-0e56-4960-87c8-e711b9b2478a.jpg"
)
target = Path(__file__).resolve().parents[1] / "src/features/deneme-4/assets/bats.png"

image = Image.open(source).convert("RGB")
width, height = image.size
pixels = image.load()

def ink(x, y):
    r, g, b = pixels[x, y]
    return max(r, g, b) > 12

def spans(indexes, gap):
    groups = []
    start = prev = indexes[0]
    for index in indexes[1:]:
        if index - prev > gap:
            groups.append((start, prev))
            start = index
        prev = index
    groups.append((start, prev))
    return groups

columns = spans([x for x in range(width) if any(ink(x, y) for y in range(height))], 4)
rows = spans([y for y in range(height) if any(ink(x, y) for x in range(width))], 4)
frames = [(left, top, right, bottom) for top, bottom in rows for left, right in columns]
cell_w = max(right - left for left, _, right, _ in frames) + 16
cell_h = max(bottom - top for _, top, _, bottom in frames) + 16
sheet = Image.new("RGBA", (cell_w * len(columns), cell_h * len(rows)), (0, 0, 0, 0))

for index, (left, top, right, bottom) in enumerate(frames):
    crop = image.crop((left, top, right + 1, bottom + 1)).convert("RGBA")
    raw = crop.load()
    for y in range(crop.height):
        for x in range(crop.width):
            r, g, b, _ = raw[x, y]
            lum = max(r, g, b)
            alpha = 0 if lum <= 12 else 255 if lum >= 40 else int((lum - 12) * 255 / 28)
            raw[x, y] = (r, g, b, alpha)
    col = index % len(columns)
    row = index // len(columns)
    sheet.paste(
        crop,
        (col * cell_w + (cell_w - crop.width) // 2, row * cell_h + (cell_h - crop.height) // 2),
        crop,
    )

target.parent.mkdir(parents=True, exist_ok=True)
sheet.save(target)
print(sheet.size, "frames", len(frames), "cell", cell_w, cell_h)
