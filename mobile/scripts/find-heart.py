from PIL import Image, ImageDraw

SRC = r"C:\Users\farec\.cursor\projects\c-Users-farec-Desktop-PlayMeet\assets\WhatsApp_Image_2026-11-05_at_01.31.48__1_-9e72ad39-e7a2-4dc7-9c42-22075189f4a2.jpg"
OUT = r"c:\Users\farec\Desktop\PlayMeet\mobile\captures\heart-detect.jpg"

image = Image.open(SRC).convert("RGB")
pixels = image.load()
width, height = image.size
seen = bytearray(width * height)


def is_icon(x, y):
    red, green, blue = pixels[x, y]
    peak = max(red, green, blue)
    span = peak - min(red, green, blue)
    if peak < 35:
        return False
    if peak > 205 and span < 38:
        return False
    return span > 28 or peak < 170


blobs = []
for y in range(height):
    for x in range(width):
        index = y * width + x
        if seen[index] or not is_icon(x, y):
            continue
        stack = [(x, y)]
        seen[index] = 1
        count = 0
        min_x = max_x = x
        min_y = max_y = y
        reds = greens = blues = 0
        while stack:
            px, py = stack.pop()
            count += 1
            red, green, blue = pixels[px, py]
            reds += red
            greens += green
            blues += blue
            min_x = min(min_x, px)
            max_x = max(max_x, px)
            min_y = min(min_y, py)
            max_y = max(max_y, py)
            for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                if nx < 0 or ny < 0 or nx >= width or ny >= height:
                    continue
                nindex = ny * width + nx
                if seen[nindex] or not is_icon(nx, ny):
                    continue
                seen[nindex] = 1
                stack.append((nx, ny))
        if count > 180:
            blobs.append((min_x, min_y, max_x, max_y, count, reds // count, greens // count, blues // count))

blobs.sort(key=lambda item: (item[1], item[0]))
print("blobs", len(blobs))
draw = image.copy()
pen = ImageDraw.Draw(draw)
for index, (x0, y0, x1, y1, count, red, green, blue) in enumerate(blobs):
    pen.rectangle((x0, y0, x1, y1), outline=(0, 255, 0))
    cx = (x0 + x1) / 2 / width
    cy = (y0 + y1) / 2 / height
    print(f"{index:02d} {cx:.3f} {cy:.3f} {x1-x0:3d}x{y1-y0:<3d} n={count:4d} rgb={red},{green},{blue}")
draw.save(OUT, quality=85)
