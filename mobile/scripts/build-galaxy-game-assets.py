"""Turn Galaxy Duel source plates into transparent PNGs, derived frames, and a catalog."""
from __future__ import annotations

import json
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw

SRC = Path(r"C:\Users\farec\.cursor\projects\c-Users-farec-Desktop-PlayMeet\assets")
OUT = Path(r"C:\Users\farec\Desktop\PlayMeet\mobile\src\features\galaxy-duel\assets\game")
CATALOG = Path(r"C:\Users\farec\Desktop\PlayMeet\mobile\src\features\galaxy-duel\game-catalog.ts")


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
    step = max(1, min(w, h) // 80)
    seeds: list[tuple[int, int]] = []
    for x in range(0, w, step):
        seeds.append((x, 0))
        seeds.append((x, h - 1))
    for y in range(0, h, step):
        seeds.append((0, y))
        seeds.append((w - 1, y))
    return seeds


def punch(src: Path) -> Image.Image:
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    pix = im.load()
    kill = flood(pix, w, h, edge_seeds(w, h), 22)
    for x, y in kill:
        r, g, b, _a = pix[x, y]
        pix[x, y] = (r, g, b, 0)
    extra: list[tuple[int, int]] = []
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a == 0 or max(r, g, b) > 36:
                continue
            if any(
                0 <= nx < w and 0 <= ny < h and pix[nx, ny][3] == 0
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))
            ):
                extra.append((x, y))
    for x, y in extra:
        r, g, b, _a = pix[x, y]
        pix[x, y] = (r, g, b, 0)
    bbox = im.getbbox()
    if bbox:
        pad = 2
        left, top, right, bottom = bbox
        im = im.crop((max(0, left - pad), max(0, top - pad), min(w, right + pad), min(h, bottom + pad)))
    return im


def save_png(im: Image.Image, rel: str) -> tuple[int, int]:
    dest = OUT / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "PNG")
    return im.size


def nose_is_up(im: Image.Image) -> bool:
    """Engines glow at the rear. A brighter bottom means the nose points up."""
    w, h = im.size
    pix = im.load()
    band = max(1, h // 5)
    top = bottom = 0
    for y in range(band):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a:
                top += r + g + b
    for y in range(h - band, h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a:
                bottom += r + g + b
    return bottom >= top


def tint_damage(im: Image.Image) -> Image.Image:
    out = im.copy()
    pix = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a < 8:
                continue
            pix[x, y] = (min(255, r + 90), int(g * 0.45), int(b * 0.45), a)
    return out


def fade_frames(src: Image.Image, rel_dir: str, count: int = 6) -> list[str]:
    w, h = src.size
    canvas_w = int(w * 1.35)
    canvas_h = int(h * 1.35)
    paths: list[str] = []
    for i in range(count):
        t = i / (count - 1)
        scale = 0.42 + 0.78 * t
        alpha = 1.0 if t < 0.5 else max(0.0, 1.0 - (t - 0.5) / 0.5)
        nw = max(1, int(w * scale))
        nh = max(1, int(h * scale))
        frame = src.resize((nw, nh), Image.Resampling.LANCZOS)
        faded = frame.copy()
        band = faded.getchannel("A").point(lambda p, a=alpha: int(p * a))
        faded.putalpha(band)
        canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
        canvas.paste(faded, ((canvas_w - nw) // 2, (canvas_h - nh) // 2), faded)
        rel = f"{rel_dir}/frame-{i:02}.png"
        save_png(canvas, rel)
        paths.append(rel)
    return paths


def ring_frames(rel_dir: str, rgb: tuple[int, int, int], count: int = 5) -> list[str]:
    paths: list[str] = []
    size = 256
    for i in range(count):
        t = i / (count - 1)
        im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(im)
        radius = int(28 + 88 * t)
        alpha = int(230 * (1 - t * 0.75))
        box = [size // 2 - radius, size // 2 - radius, size // 2 + radius, size // 2 + radius]
        draw.ellipse(box, outline=(*rgb, alpha), width=max(3, int(10 * (1 - t * 0.5))))
        rel = f"{rel_dir}/frame-{i:02}.png"
        save_png(im, rel)
        paths.append(rel)
    return paths


def burst_frames(rel_dir: str, rgb: tuple[int, int, int], count: int = 4) -> list[str]:
    paths: list[str] = []
    size = 192
    for i in range(count):
        t = (i + 1) / count
        im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(im)
        alpha = int(255 * (1 - t * 0.7))
        cx = cy = size // 2
        reach = int(20 + 70 * t)
        for k in range(8):
            ang = k * 3.14159 / 4
            x = cx + int(reach * __import__("math").cos(ang))
            y = cy + int(reach * __import__("math").sin(ang))
            r = max(2, int(8 * (1 - t * 0.4)))
            draw.ellipse([x - r, y - r, x + r, y + r], fill=(*rgb, alpha))
        rel = f"{rel_dir}/frame-{i:02}.png"
        save_png(im, rel)
        paths.append(rel)
    return paths


def muzzle(rel: str, rgb: tuple[int, int, int]) -> None:
    im = Image.new("RGBA", (64, 128), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    draw.polygon([(32, 4), (48, 120), (16, 120)], fill=(*rgb, 230))
    draw.polygon([(32, 24), (40, 110), (24, 110)], fill=(255, 255, 255, 220))
    save_png(im, rel)


def star_layer(rel: str, count: int, radius: int, seed: int) -> None:
    import random

    rng = random.Random(seed)
    w, h = 720, 1280
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    for _ in range(count):
        x = rng.randint(2, w - 3)
        y = rng.randint(2, h - 3)
        a = rng.randint(120, 255)
        r = 1 if radius == 1 else rng.choice((1, 2, 2))
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, a))
    save_png(im, rel)


def energy_sprites() -> None:
    crystal = Image.new("RGBA", (128, 160), (0, 0, 0, 0))
    draw = ImageDraw.Draw(crystal)
    draw.polygon([(64, 8), (112, 64), (64, 150), (16, 64)], fill=(80, 220, 255, 230))
    draw.polygon([(64, 28), (92, 64), (64, 120), (36, 64)], fill=(230, 255, 255, 240))
    save_png(crystal, "backgrounds/energy-crystal.png")

    orb = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    draw = ImageDraw.Draw(orb)
    draw.ellipse([16, 16, 112, 112], fill=(255, 186, 64, 230))
    draw.ellipse([40, 36, 78, 74], fill=(255, 244, 210, 240))
    save_png(orb, "backgrounds/energy-orb.png")


def icon(rel: str, kind: str) -> None:
    im = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    if kind == "rapid":
        for i, y in enumerate((48, 104, 160)):
            draw.polygon([(128, y), (188, y + 36), (68, y + 36)], fill=(80, 220, 255, 240))
    elif kind == "spread":
        draw.polygon([(128, 36), (150, 200), (106, 200)], fill=(255, 210, 80, 240))
        draw.polygon([(64, 70), (90, 210), (40, 200)], fill=(255, 170, 40, 230))
        draw.polygon([(192, 70), (216, 200), (166, 210)], fill=(255, 170, 40, 230))
    elif kind == "laser":
        draw.rectangle([112, 24, 144, 232], fill=(180, 250, 255, 240))
        draw.rectangle([120, 36, 136, 220], fill=(255, 255, 255, 250))
    elif kind == "plasma":
        draw.ellipse([48, 48, 208, 208], outline=(255, 80, 200, 240), width=10)
        draw.ellipse([88, 88, 168, 168], fill=(255, 140, 230, 240))
    elif kind == "shield":
        draw.polygon(
            [(128, 28), (210, 72), (196, 168), (128, 224), (60, 168), (46, 72)],
            outline=(70, 220, 255, 255),
            width=12,
        )
    elif kind == "damage":
        draw.polygon([(128, 20), (156, 100), (236, 108), (172, 156), (196, 232), (128, 188), (60, 232), (84, 156), (20, 108), (100, 100)], fill=(255, 120, 40, 240))
    elif kind == "life":
        draw.ellipse([48, 56, 132, 140], fill=(80, 230, 255, 240))
        draw.ellipse([124, 56, 208, 140], fill=(80, 230, 255, 240))
        draw.polygon([(48, 110), (208, 110), (128, 214)], fill=(80, 230, 255, 240))
    elif kind == "magnet":
        draw.arc([56, 36, 200, 180], 180, 0, fill=(70, 210, 255, 255), width=22)
        draw.rectangle([56, 110, 86, 210], fill=(255, 90, 90, 240))
        draw.rectangle([170, 110, 200, 210], fill=(80, 140, 255, 240))
    elif kind == "bomb":
        draw.ellipse([58, 70, 198, 210], fill=(40, 48, 64, 255))
        draw.ellipse([58, 70, 198, 210], outline=(255, 150, 40, 255), width=8)
        draw.line([(150, 78), (190, 36)], fill=(255, 200, 80, 255), width=8)
        draw.ellipse([176, 22, 204, 50], fill=(255, 230, 120, 255))
    elif kind == "speed":
        draw.polygon([(40, 128), (150, 48), (150, 96), (220, 96), (220, 160), (150, 160), (150, 208)], fill=(190, 255, 120, 240))
    save_png(im, rel)


def dp_size(px: tuple[int, int], width: int) -> dict[str, int]:
    w, h = px
    height = max(8, round(width * (h / w)))
    return {"width": width, "height": height}


def main() -> None:
    plates = {
        "players/player-1-blue.png": "gd-player-1-blue.jpg",
        "players/player-2-red.png": "gd-player-2-red.jpg",
        "enemies/enemy-01-scout.png": "gd-enemy-01-scout.jpg",
        "enemies/enemy-02-fighter.png": "gd-enemy-02-fighter.jpg",
        "enemies/enemy-03-heavy.png": "gd-enemy-03-heavy.jpg",
        "enemies/enemy-04-hunter.png": "gd-enemy-04-hunter.jpg",
        "enemies/enemy-05-tank.png": "gd-enemy-05-tank.jpg",
        "enemies/enemy-06-sniper.png": "gd-enemy-06-sniper.jpg",
        "enemies/enemy-07-elite.png": "gd-enemy-07-elite.jpg",
        "projectiles/projectile-blue-laser.png": "gd-projectile-blue-laser.jpg",
        "projectiles/projectile-red-laser.png": "gd-projectile-red-laser.jpg",
        "projectiles/projectile-twin-laser.png": "gd-projectile-twin-laser.jpg",
        "projectiles/projectile-triple-shot.png": "gd-projectile-triple-shot.jpg",
        "projectiles/projectile-energy-wave.png": "gd-projectile-energy-wave.jpg",
        "projectiles/projectile-plasma-orb.png": "gd-projectile-plasma-orb.jpg",
        "projectiles/projectile-piercer.png": "gd-projectile-piercer.jpg",
        "projectiles/projectile-super.png": "gd-projectile-super.jpg",
        "powerups/pickups/rapid-fire.png": "gd-powerup-rapid.jpg",
        "powerups/pickups/spread-shot.png": "gd-powerup-spread.jpg",
        "powerups/pickups/laser-beam.png": "gd-powerup-laser.jpg",
        "powerups/pickups/plasma.png": "gd-powerup-plasma.jpg",
        "powerups/pickups/shield.png": "gd-powerup-shield.jpg",
        "powerups/pickups/damage-boost.png": "gd-powerup-damage.jpg",
        "powerups/pickups/extra-life.png": "gd-powerup-life.jpg",
        "powerups/pickups/magnet.png": "gd-powerup-magnet.jpg",
        "powerups/pickups/bomb.png": "gd-powerup-bomb.jpg",
        "powerups/pickups/speed-boost.png": "gd-powerup-speed.jpg",
        "effects/sources/explosion-small.png": "gd-fx-explosion-small.jpg",
        "effects/sources/explosion-medium.png": "gd-fx-explosion-medium.jpg",
        "effects/sources/explosion-large.png": "gd-fx-explosion-large.jpg",
        "effects/sources/player-death.png": "gd-fx-player-death.jpg",
        "effects/sources/impact.png": "gd-fx-impact.jpg",
        "backgrounds/asteroid-a.png": "gd-asteroid-a.jpg",
        "backgrounds/asteroid-b.png": "gd-asteroid-b.jpg",
        "backgrounds/asteroid-c.png": "gd-asteroid-c.jpg",
        "backgrounds/nebula.png": "gd-bg-nebula.jpg",
    }
    sizes: dict[str, tuple[int, int]] = {}
    noses: dict[str, str] = {}
    for rel, src_name in plates.items():
        im = punch(SRC / src_name)
        sizes[rel] = save_png(im, rel)
        if rel.startswith("players/") or rel.startswith("enemies/"):
            noses[rel] = "up" if nose_is_up(im) else "down"
        print(f"{rel} {sizes[rel]} nose={noses.get(rel, '-')}")

    blue = Image.open(OUT / "players/player-1-blue.png")
    red = Image.open(OUT / "players/player-2-red.png")
    sizes["players/player-1-blue-hit.png"] = save_png(tint_damage(blue), "players/player-1-blue-hit.png")
    sizes["players/player-2-red-hit.png"] = save_png(tint_damage(red), "players/player-2-red-hit.png")
    muzzle("effects/muzzle-blue.png", (80, 220, 255))
    muzzle("effects/muzzle-red.png", (255, 60, 90))
    sizes["effects/muzzle-blue.png"] = (64, 128)
    sizes["effects/muzzle-red.png"] = (64, 128)

    space = Image.open(SRC / "gd-bg-space.jpg").convert("RGB")
    space.save(OUT / "backgrounds/space.png", "PNG")
    sizes["backgrounds/space.png"] = space.size

    nebula = Image.open(OUT / "backgrounds/nebula.png")
    mag = Image.new("RGBA", nebula.size, (0, 0, 0, 0))
    cya = Image.new("RGBA", nebula.size, (0, 0, 0, 0))
    sp, mp, cp = nebula.load(), mag.load(), cya.load()
    for y in range(nebula.size[1]):
        for x in range(nebula.size[0]):
            r, g, b, a = sp[x, y]
            if a == 0:
                continue
            if r >= b:
                mp[x, y] = (r, g, b, a)
            else:
                cp[x, y] = (r, g, b, a)
    sizes["backgrounds/nebula-magenta.png"] = save_png(mag, "backgrounds/nebula-magenta.png")
    sizes["backgrounds/nebula-cyan.png"] = save_png(cya, "backgrounds/nebula-cyan.png")

    star_layer("backgrounds/stars-far.png", 160, 1, 3)
    star_layer("backgrounds/stars-near.png", 48, 2, 9)
    sizes["backgrounds/stars-far.png"] = (720, 1280)
    sizes["backgrounds/stars-near.png"] = (720, 1280)
    energy_sprites()
    sizes["backgrounds/energy-crystal.png"] = (128, 160)
    sizes["backgrounds/energy-orb.png"] = (128, 128)

    icon_kinds = {
        "powerups/icons/rapid-fire.png": "rapid",
        "powerups/icons/spread-shot.png": "spread",
        "powerups/icons/laser-beam.png": "laser",
        "powerups/icons/plasma.png": "plasma",
        "powerups/icons/shield.png": "shield",
        "powerups/icons/damage-boost.png": "damage",
        "powerups/icons/extra-life.png": "life",
        "powerups/icons/magnet.png": "magnet",
        "powerups/icons/bomb.png": "bomb",
        "powerups/icons/speed-boost.png": "speed",
    }
    for rel, kind in icon_kinds.items():
        icon(rel, kind)
        sizes[rel] = (256, 256)

    anims: dict[str, dict] = {}
    derived = {
        "explosion-small": (Image.open(OUT / "effects/sources/explosion-small.png"), "effects/explosion-small", 60),
        "explosion-medium": (Image.open(OUT / "effects/sources/explosion-medium.png"), "effects/explosion-medium", 70),
        "explosion-large": (Image.open(OUT / "effects/sources/explosion-large.png"), "effects/explosion-large", 80),
        "player-death": (Image.open(OUT / "effects/sources/player-death.png"), "effects/player-death", 80),
        "impact": (Image.open(OUT / "effects/sources/impact.png"), "effects/impact", 40),
    }
    for key, (im, folder, ms) in derived.items():
        frames = fade_frames(im, folder, 6 if key != "impact" else 4)
        for frame in frames:
            sizes[frame] = Image.open(OUT / frame).size
        anims[key] = {"frameMs": ms, "derived": True, "frames": frames}

    for key, rgb, folder, ms, count in (
        ("shield", (70, 220, 255), "effects/shield", 70, 5),
        ("player-hit", (255, 80, 100), "effects/player-hit", 50, 4),
        ("pickup", (255, 220, 120), "effects/pickup", 60, 4),
    ):
        frames = ring_frames(folder, rgb, count) if key == "shield" else burst_frames(folder, rgb, count)
        for frame in frames:
            sizes[frame] = Image.open(OUT / frame).size
        anims[key] = {"frameMs": ms, "derived": False, "frames": frames}

    write_catalog(sizes, noses, anims)
    pngs = list(OUT.rglob("*.png"))
    print(f"PNG_COUNT {len(pngs)}")


def write_catalog(sizes: dict[str, tuple[int, int]], noses: dict[str, str], anims: dict[str, dict]) -> None:
    lines = [
        "/** Galaxy Duel phase-2 asset catalog. Layout and HUD are unchanged.",
        " *  Stats are tunable placeholders. No combat loop lives here.",
        " *  `derived` animations are scale-and-fade cels of one plate, not hand-drawn frames.",
        " *  Power-up icons are flat symbols. Pickups are the illustrated field objects.",
        " */",
        "",
    ]
    keys = sorted(sizes)
    lines.append("const file = {")
    for rel in keys:
        key = rel.replace("\\", "/")
        lines.append(f'  "{key}": require("./assets/game/{key}") as number,')
    lines.append("} as const;")
    lines.append("")
    lines.append("export type CollisionBox = { x: number; y: number; width: number; height: number };")
    lines.append("export type PixelSize = { width: number; height: number };")
    lines.append("")
    lines.append("function box(x: number, y: number, width: number, height: number): CollisionBox {")
    lines.append("  return { x, y, width, height };")
    lines.append("}")
    lines.append("")

    def sprite(rel: str, dp_w: int, collision: tuple[float, float, float, float]) -> str:
        w, h = sizes[rel]
        dps = dp_size((w, h), dp_w)
        cx, cy, cw, ch = collision
        return (
            "{ "
            f'source: file["{rel}"], '
            f"sourcePx: {{ width: {w}, height: {h} }}, "
            f"suggestedDp: {{ width: {dps['width']}, height: {dps['height']} }}, "
            f"collision: box({cx}, {cy}, {cw}, {ch}) "
            "}"
        )

    hull = (0.18, 0.08, 0.64, 0.78)
    lines.append("export const gameCatalog = {")
    lines.append("  players: {")
    for side, rel, hit, muzzle_rel, team in (
        ("blue", "players/player-1-blue.png", "players/player-1-blue-hit.png", "effects/muzzle-blue.png", "blue"),
        ("red", "players/player-2-red.png", "players/player-2-red-hit.png", "effects/muzzle-red.png", "red"),
    ):
        lines.append(f"    {side}: {{")
        lines.append(f'      id: "{"player-1" if side == "blue" else "player-2"}",')
        lines.append(f'      team: "{team}",')
        lines.append(f'      nose: "{noses[rel]}",')
        lines.append("      suggestedRotationDeg: 0,")
        lines.append("      stats: { hp: 100, speed: 280, damage: 10 },")
        lines.append(f"      idle: {sprite(rel, 78, hull)},")
        lines.append(f"      damaged: {sprite(hit, 78, hull)},")
        lines.append(f'      firing: {{ muzzle: file["{muzzle_rel}"] }},')
        lines.append('      destroyed: "player-death",')
        lines.append("    },")
    lines.append("  },")

    enemies = [
        ("scout", "enemies/enemy-01-scout.png", 40, (0.28, 0.06, 0.44, 0.84), {"hp": 1, "speed": 220, "damage": 8, "score": 50}),
        ("fighter", "enemies/enemy-02-fighter.png", 56, (0.16, 0.08, 0.68, 0.8), {"hp": 3, "speed": 140, "damage": 12, "score": 100}),
        ("heavy", "enemies/enemy-03-heavy.png", 72, (0.14, 0.06, 0.72, 0.84), {"hp": 8, "speed": 70, "damage": 18, "score": 250}),
        ("hunter", "enemies/enemy-04-hunter.png", 58, (0.12, 0.08, 0.76, 0.8), {"hp": 2, "speed": 200, "damage": 10, "score": 150}),
        ("tank", "enemies/enemy-05-tank.png", 74, (0.16, 0.08, 0.68, 0.84), {"hp": 14, "speed": 48, "damage": 16, "score": 400}),
        ("sniper", "enemies/enemy-06-sniper.png", 36, (0.3, 0.04, 0.4, 0.9), {"hp": 4, "speed": 60, "damage": 22, "score": 300}),
        ("elite", "enemies/enemy-07-elite.png", 100, (0.16, 0.06, 0.68, 0.86), {"hp": 40, "speed": 40, "damage": 28, "score": 1500}),
    ]
    lines.append("  enemies: [")
    for key, rel, dp_w, col, stats in enemies:
        rot = 0 if noses[rel] == "down" else 180
        lines.append("    {")
        lines.append(f'      id: "{key}",')
        lines.append(f'      nose: "{noses[rel]}",')
        lines.append(f"      suggestedRotationDeg: {rot},")
        lines.append(f"      stats: {json.dumps(stats)},")
        lines.append(f"      sprite: {sprite(rel, dp_w, col)},")
        lines.append("    },")
    lines.append("  ],")

    shots = [
        ("blue-laser", "projectiles/projectile-blue-laser.png", 14, 640, 10, (0.35, 0.1, 0.3, 0.8)),
        ("red-laser", "projectiles/projectile-red-laser.png", 14, 640, 10, (0.35, 0.1, 0.3, 0.8)),
        ("twin-laser", "projectiles/projectile-twin-laser.png", 28, 640, 8, (0.2, 0.12, 0.6, 0.76)),
        ("triple-shot", "projectiles/projectile-triple-shot.png", 36, 600, 7, (0.12, 0.16, 0.76, 0.68)),
        ("energy-wave", "projectiles/projectile-energy-wave.png", 72, 480, 14, (0.08, 0.28, 0.84, 0.44)),
        ("plasma-orb", "projectiles/projectile-plasma-orb.png", 28, 420, 16, (0.22, 0.22, 0.56, 0.56)),
        ("piercer", "projectiles/projectile-piercer.png", 16, 820, 22, (0.38, 0.04, 0.24, 0.92)),
        ("super", "projectiles/projectile-super.png", 36, 700, 40, (0.28, 0.06, 0.44, 0.88)),
    ]
    lines.append("  projectiles: [")
    for key, rel, dp_w, speed, damage, col in shots:
        lines.append("    {")
        lines.append(f'      id: "{key}",')
        lines.append('      direction: "up",')
        lines.append(f"      speed: {speed},")
        lines.append(f"      damage: {damage},")
        lines.append("      animation: null,")
        lines.append(f"      sprite: {sprite(rel, dp_w, col)},")
        lines.append("    },")
    lines.append("  ],")

    powers = [
        ("rapid-fire", "Faster fire", 8000),
        ("spread-shot", "Multi-direction shots", 8000),
        ("laser-beam", "Sustained beam", 6000),
        ("plasma", "Plasma orbs", 8000),
        ("shield", "Temporary protection", 5000),
        ("damage-boost", "Higher damage", 8000),
        ("extra-life", "Extra hit point", 0),
        ("magnet", "Pull nearby pickups", 7000),
        ("bomb", "Area damage", 0),
        ("speed-boost", "Faster movement", 6000),
    ]
    lines.append("  powerUps: [")
    for key, label, duration in powers:
        lines.append("    {")
        lines.append(f'      id: "{key}",')
        lines.append(f'      label: "{label}",')
        lines.append(f"      durationMs: {duration},")
        lines.append(f'      icon: file["powerups/icons/{key}.png"],')
        lines.append(f'      pickup: {sprite(f"powerups/pickups/{key}.png", 36, (0.2, 0.2, 0.6, 0.6))},')
        lines.append("    },")
    lines.append("  ],")

    lines.append("  animations: {")
    for key, anim in anims.items():
        frame_list = ", ".join(f'file["{rel}"]' for rel in anim["frames"])
        fw, fh = sizes[anim["frames"][0]]
        lines.append(f'    "{key}": {{')
        lines.append(f"      frameMs: {anim['frameMs']},")
        lines.append(f"      derived: {str(anim['derived']).lower()},")
        lines.append(f"      framePx: {{ width: {fw}, height: {fh} }},")
        lines.append(f"      frames: [{frame_list}],")
        lines.append("    },")
    lines.append("  },")

    lines.append("  background: {")
    for rel, dp_w in (
        ("backgrounds/space.png", 390),
        ("backgrounds/stars-far.png", 390),
        ("backgrounds/stars-near.png", 390),
        ("backgrounds/nebula.png", 390),
        ("backgrounds/nebula-magenta.png", 390),
        ("backgrounds/nebula-cyan.png", 390),
        ("backgrounds/asteroid-a.png", 54),
        ("backgrounds/asteroid-b.png", 64),
        ("backgrounds/asteroid-c.png", 48),
        ("backgrounds/energy-crystal.png", 22),
        ("backgrounds/energy-orb.png", 20),
    ):
        field = rel.split("/")[-1].replace(".png", "").replace("-", "_")
        lines.append(f"    {field}: {sprite(rel, dp_w, (0.1, 0.1, 0.8, 0.8))},")
    lines.append("    scroll: {")
    lines.append('      space: "full-bleed plate, duplicate vertically to loop",')
    lines.append('      starsFar: "tile vertically",')
    lines.append('      starsNear: "tile vertically, faster than starsFar",')
    lines.append('      nebula: "slow vertical drift, black is transparent",')
    lines.append("    },")
    lines.append("  },")
    lines.append("} as const;")
    lines.append("")
    lines.append("export type GameCatalog = typeof gameCatalog;")
    lines.append("")
    CATALOG.write_text("\n".join(lines), encoding="utf-8")
    print(f"catalog {CATALOG}")


if __name__ == "__main__":
    main()
