from PIL import Image

src = Image.open(
    r"C:\Users\farec\.cursor\projects\c-Users-farec-Desktop-PlayMeet\assets\deneme-scoreboard.jpg"
).convert("RGB")
w, h = src.size
px = src.load()

minx, miny, maxx, maxy = w, h, 0, 0
for y in range(h):
    for x in range(w):
        r, g, b = px[x, y]
        if r + g + b > 28:
            if x < minx:
                minx = x
            if y < miny:
                miny = y
            if x > maxx:
                maxx = x
            if y > maxy:
                maxy = y
pad = 8
box = (max(0, minx - pad), max(0, miny - pad), min(w, maxx + pad + 1), min(h, maxy + pad + 1))
crop = src.crop(box).convert("RGBA")
cw, ch = crop.size
cp = crop.load()
print("crop", cw, ch, "from", box)

# transparent holes: near-black
holes = []
seen = [[False] * cw for _ in range(ch)]
for y in range(ch):
    for x in range(cw):
        r, g, b, a = cp[x, y]
        if r + g + b < 18:
            cp[x, y] = (0, 0, 0, 0)
            if not seen[y][x]:
                stack = [(x, y)]
                seen[y][x] = True
                xs, ys = [], []
                while stack:
                    cx, cy = stack.pop()
                    xs.append(cx)
                    ys.append(cy)
                    for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                        if 0 <= nx < cw and 0 <= ny < ch and not seen[ny][nx]:
                            rr, gg, bb, _ = cp[nx, ny]
                            if rr + gg + bb < 18:
                                seen[ny][nx] = True
                                stack.append((nx, ny))
                if len(xs) > 400:
                    holes.append((min(xs), min(ys), max(xs), max(ys), len(xs)))

print("holes", holes)

# clock interior: dark purple inside the gold pill, lower middle
dark = []
for y in range(int(ch * 0.55), ch):
    for x in range(int(cw * 0.3), int(cw * 0.7)):
        r, g, b, a = cp[x, y]
        if a > 200 and r < 70 and g < 50 and b < 90 and r + g + b > 20:
            dark.append((x, y))
if dark:
    xs = [p[0] for p in dark]
    ys = [p[1] for p in dark]
    print("clock-dark", min(xs), min(ys), max(xs), max(ys), len(dark))

crop.save(r"src\features\deneme-4\assets\scoreboard.png")
print("saved")
