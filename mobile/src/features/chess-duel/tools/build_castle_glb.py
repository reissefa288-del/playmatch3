"""Low-poly royal castle GLBs for Chess Duel. Vertex colors carry baked shade."""

from __future__ import annotations

import base64
import json
import math
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "assets" / "models"

TORCHES = (
    (-2.42, 1.72, 1.05),
    (2.42, 1.72, 1.05),
    (-2.42, 1.72, -1.35),
    (2.42, 1.72, -1.35),
)

STONE = (0.48, 0.46, 0.52)
STONE_DARK = (0.30, 0.28, 0.34)
SLATE_LIGHT = (0.70, 0.66, 0.60)
SLATE_DARK = (0.34, 0.30, 0.28)
GOLD = (0.92, 0.74, 0.32)
FLAME = (1.0, 0.48, 0.12)
FLAME_CORE = (1.0, 0.86, 0.42)
WATER = (0.28, 0.62, 0.82)
WATER_DEEP = (0.10, 0.28, 0.48)
FOG = (0.62, 0.66, 0.82)
MOON = (0.96, 0.93, 0.82)
WINDOW = (1.0, 0.78, 0.42)
ROOF = (0.32, 0.18, 0.28)


def shade(point, normal, color):
    up = max(0.0, normal[1])
    ao = 0.58 + 0.42 * up
    warm = 0.0
    for torch in TORCHES:
        dx = point[0] - torch[0]
        dy = point[1] - torch[1]
        dz = point[2] - torch[2]
        dist = math.sqrt(dx * dx + dy * dy + dz * dz)
        warm += max(0.0, 1.0 - dist / 3.2)
    return (
        min(1.0, color[0] * ao + warm * 0.16),
        min(1.0, color[1] * ao + warm * 0.07),
        min(1.0, color[2] * ao),
    )


class Mesh:
    def __init__(self):
        self.positions: list[float] = []
        self.normals: list[float] = []
        self.colors: list[float] = []
        self.indices: list[int] = []

    def tri(self, a, b, c, color, lit=True):
        ax, ay, az = b[0] - a[0], b[1] - a[1], b[2] - a[2]
        bx, by, bz = c[0] - a[0], c[1] - a[1], c[2] - a[2]
        nx, ny, nz = ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx
        length = math.sqrt(nx * nx + ny * ny + nz * nz) or 1.0
        normal = (nx / length, ny / length, nz / length)
        base = len(self.positions) // 3
        for point in (a, b, c):
            tint = shade(point, normal, color) if lit else color
            self.positions.extend(point)
            self.normals.extend(normal)
            self.colors.extend(tint)
        self.indices.extend((base, base + 1, base + 2))

    def quad(self, a, b, c, d, color, lit=True):
        self.tri(a, b, c, color, lit)
        self.tri(a, c, d, color, lit)

    def box(self, cx, cy, cz, sx, sy, sz, color, lit=True):
        hx, hy, hz = sx / 2, sy / 2, sz / 2
        v = [
            (cx - hx, cy - hy, cz - hz),
            (cx + hx, cy - hy, cz - hz),
            (cx + hx, cy + hy, cz - hz),
            (cx - hx, cy + hy, cz - hz),
            (cx - hx, cy - hy, cz + hz),
            (cx + hx, cy - hy, cz + hz),
            (cx + hx, cy + hy, cz + hz),
            (cx - hx, cy + hy, cz + hz),
        ]
        faces = (
            (0, 1, 2, 3),
            (5, 4, 7, 6),
            (4, 0, 3, 7),
            (1, 5, 6, 2),
            (3, 2, 6, 7),
            (4, 5, 1, 0),
        )
        for a, b, c, d in faces:
            self.quad(v[a], v[b], v[c], v[d], color, lit)

    def prism(self, cx, cz, y0, y1, radius, sides, color, lit=True):
        ring0 = []
        ring1 = []
        for i in range(sides):
            angle = (i / sides) * math.tau
            x = cx + math.cos(angle) * radius
            z = cz + math.sin(angle) * radius
            ring0.append((x, y0, z))
            ring1.append((x, y1, z))
        for i in range(sides):
            j = (i + 1) % sides
            self.quad(ring0[i], ring0[j], ring1[j], ring1[i], color, lit)

    def cone(self, cx, cz, y0, y1, radius, sides, color, lit=True):
        apex = (cx, y1, cz)
        for i in range(sides):
            a0 = (i / sides) * math.tau
            a1 = ((i + 1) / sides) * math.tau
            p0 = (cx + math.cos(a0) * radius, y0, cz + math.sin(a0) * radius)
            p1 = (cx + math.cos(a1) * radius, y0, cz + math.sin(a1) * radius)
            self.tri(p0, p1, apex, color, lit)

    def ribbon(self, points, depth, thick, color, lit=True):
        half_d = depth / 2
        for i in range(len(points) - 1):
            x0, y0, z0 = points[i]
            x1, y1, z1 = points[i + 1]
            dx, dy = x1 - x0, y1 - y0
            length = math.sqrt(dx * dx + dy * dy) or 1.0
            px, py = -dy / length * thick, dx / length * thick
            a = (x0 + px, y0 + py, z0 - half_d)
            b = (x1 + px, y1 + py, z1 - half_d)
            c = (x1 - px, y1 - py, z1 - half_d)
            d = (x0 - px, y0 - py, z0 - half_d)
            e = (x0 + px, y0 + py, z0 + half_d)
            f = (x1 + px, y1 + py, z1 + half_d)
            g = (x1 - px, y1 - py, z1 + half_d)
            h = (x0 - px, y0 - py, z0 + half_d)
            self.quad(a, b, f, e, color, lit)
            self.quad(d, h, g, c, color, lit)
            self.quad(e, f, g, h, color, lit)
            self.quad(a, d, c, b, color, lit)

    def grid(self, origin, axis_u, axis_v, nu, nv, color, lit=True):
        def point(iu, iv):
            return (
                origin[0] + axis_u[0] * iu + axis_v[0] * iv,
                origin[1] + axis_u[1] * iu + axis_v[1] * iv,
                origin[2] + axis_u[2] * iu + axis_v[2] * iv,
            )

        for iv in range(nv):
            for iu in range(nu):
                self.quad(point(iu, iv), point(iu + 1, iv), point(iu + 1, iv + 1), point(iu, iv + 1), color, lit)


def arch_points(x, z, span, rise, steps):
    points = []
    for i in range(steps + 1):
        t = i / steps
        points.append((x - span / 2 * (1 - t), rise * math.sin(t * math.pi / 2), z))
    for i in range(1, steps + 1):
        t = i / steps
        points.append((x + span / 2 * t, rise * math.sin((1 - t) * math.pi / 2), z))
    return points


def build_floor():
    mesh = Mesh()
    mesh.box(0, -0.18, -0.2, 9.4, 0.28, 8.6, STONE_DARK)
    for row in range(8):
        for col in range(8):
            color = SLATE_LIGHT if (row + col) % 2 == 0 else SLATE_DARK
            x = -1.75 + col * 0.5
            z = -1.75 + row * 0.5
            mesh.box(x, 0.045, z, 0.48, 0.04, 0.48, color)
    mesh.box(0, 0.02, -0.15, 4.35, 0.03, 4.35, GOLD)
    mesh.box(0, 0.01, 2.55, 5.2, 0.08, 1.15, STONE)
    mesh.box(-3.55, 0.02, -0.4, 2.2, 0.06, 6.4, STONE_DARK)
    mesh.box(3.55, 0.02, -0.4, 2.2, 0.06, 6.4, STONE_DARK)
    return [("Floor", "solid", mesh)]


def build_arches():
    mesh = Mesh()
    for side in (-1, 1):
        x = side * 2.48
        for z, height in ((1.35, 2.55), (-0.15, 2.7), (-1.7, 2.55)):
            mesh.box(x, 0.12, z, 0.42, 0.24, 0.42, STONE_DARK)
            mesh.box(x, height * 0.48, z, 0.28, height * 0.78, 0.28, STONE)
            mesh.box(x, height * 0.9, z, 0.4, 0.16, 0.4, STONE_DARK)
        points = arch_points(x, 1.35, 1.55, 3.15, 5)
        lifted = [(px, py + 1.55, pz) for px, py, pz in points]
        mesh.ribbon(lifted, 0.22, 0.07, STONE)
        points = arch_points(x, -0.9, 1.7, 3.25, 5)
        lifted = [(px, py + 1.45, pz) for px, py, pz in points]
        mesh.ribbon(lifted, 0.22, 0.07, STONE_DARK)
    return [("Arches", "solid", mesh)]


def build_castle():
    stone = Mesh()
    glow = Mesh()
    stone.box(-3.15, 1.7, -3.55, 2.4, 3.4, 0.34, STONE)
    stone.box(3.15, 1.7, -3.55, 2.4, 3.4, 0.34, STONE)
    stone.box(0, 3.15, -3.55, 3.2, 0.7, 0.34, STONE_DARK)
    stone.box(-4.55, 1.55, -1.1, 0.32, 3.1, 4.8, STONE)
    stone.box(4.55, 1.55, -1.1, 0.32, 3.1, 4.8, STONE)
    for side in (-1, 1):
        x = side * 3.55
        stone.prism(x, -3.35, 0, 3.5, 0.62, 8, STONE)
        stone.cone(x, -3.35, 3.5, 4.85, 0.78, 8, ROOF)
        for i in range(8):
            angle = (i / 8) * math.tau
            stone.box(
                x + math.cos(angle) * 0.62,
                3.35,
                -3.35 + math.sin(angle) * 0.62,
                0.16,
                0.28,
                0.16,
                STONE_DARK,
            )
    for x in (-1.15, -0.55, 0.55, 1.15):
        glow.box(x, 2.55, -3.36, 0.28, 0.7, 0.08, WINDOW, lit=False)
    return [("Castle", "solid", stone), ("CastleWindows", "glow", glow)]


def build_distant():
    stone = Mesh()
    glow = Mesh()
    moon = Mesh()
    stone.box(0, 4.6, -8.4, 3.4, 1.5, 0.4, STONE_DARK)
    stone.prism(-1.5, -8.5, 4.2, 6.4, 0.38, 6, STONE)
    stone.prism(1.5, -8.5, 4.2, 6.1, 0.34, 6, STONE)
    stone.cone(-1.5, -8.5, 6.4, 7.35, 0.46, 6, ROOF)
    stone.cone(1.5, -8.5, 6.1, 6.95, 0.42, 6, ROOF)
    stone.box(0, 5.15, -8.15, 1.1, 0.7, 0.2, STONE)
    for x in (-1.5, -0.4, 0.45, 1.5):
        glow.box(x, 5.2, -8.1, 0.16, 0.28, 0.06, WINDOW, lit=False)
    moon.prism(2.7, -7.6, 6.4, 6.55, 0.55, 10, MOON, lit=False)
    return [("DistantCastle", "solid", stone), ("DistantWindows", "glow", glow), ("Moon", "solid", moon)]


def build_torches():
    holders = Mesh()
    parts: list[tuple] = [("TorchHolders", "gold", holders)]
    for index, (x, y, z) in enumerate(TORCHES):
        holders.box(x, y - 0.08, z, 0.16, 0.1, 0.16, GOLD, lit=False)
        holders.box(x, y + 0.08, z, 0.1, 0.22, 0.1, (0.25, 0.18, 0.12))
        flame = Mesh()
        flame.cone(0, 0, 0.18, 0.62, 0.09, 6, FLAME, lit=False)
        flame.cone(0, 0, 0.28, 0.5, 0.04, 5, FLAME_CORE, lit=False)
        parts.append((f"Flame{index}", "flame", flame, (x, y, z)))
    return parts


def build_waterfall():
    stone = Mesh()
    fall = Mesh()
    pool = Mesh()
    stone.box(-2.95, 1.45, -0.15, 0.55, 2.9, 2.1, STONE_DARK)
    stone.box(-2.72, 2.7, -0.15, 0.28, 0.24, 1.4, STONE)
    fall.grid((-2.82, 2.5, -0.85), (0.0, 0.0, 0.17), (0.06, -0.25, 0.0), 10, 10, WATER, lit=False)
    pool.grid((-2.55, 0.07, -1.0), (0.55, 0.0, 0.0), (0.0, 0.0, 0.2), 4, 10, WATER_DEEP, lit=False)
    return [("Cliff", "solid", stone), ("Waterfall", "waterfall", fall), ("Pool", "water", pool)]


def build_ornaments():
    gold = Mesh()
    cloth = Mesh()
    fog = Mesh()
    for side in (-1, 1):
        x = side * 3.55
        gold.cone(x, -3.35, 4.7, 5.15, 0.16, 6, GOLD, lit=False)
        cloth.box(side * 4.35, 2.15, -0.4, 0.06, 0.9, 0.42, (0.62, 0.16, 0.28), lit=False)
        gold.box(side * 4.35, 2.55, -0.4, 0.08, 0.08, 0.46, GOLD, lit=False)
    for i in range(8):
        angle = (i / 8) * math.tau
        gold.box(math.cos(angle) * 0.42, 3.35, -3.36 + math.sin(angle) * 0.08, 0.1, 0.1, 0.08, GOLD, lit=False)
    fog.box(0, 2.2, 0.4, 6.5, 1.6, 0.02, FOG, lit=False)
    fog.box(0.4, 3.4, -2.2, 7.2, 1.2, 0.02, FOG, lit=False)
    return [("Ornaments", "gold", gold), ("Banners", "solid", cloth), ("Fog", "fog", fog)]


PARTS = (
    ("floor", build_floor),
    ("arches", build_arches),
    ("castle", build_castle),
    ("distant-castle", build_distant),
    ("torches", build_torches),
    ("waterfall", build_waterfall),
    ("ornaments", build_ornaments),
)


def pad(data: bytes, fill: bytes) -> bytes:
    extra = (-len(data)) % 4
    return data + fill * extra


def mesh_glb(parts: list[tuple]) -> bytes:
    blob = bytearray()
    views = []
    accessors = []
    meshes = []
    nodes = []
    materials = []
    roles_seen: dict[str, int] = {}

    def view_for(raw: bytes, target: int) -> int:
        start = len(blob)
        blob.extend(raw)
        while len(blob) % 4:
            blob.append(0)
        views.append({"buffer": 0, "byteOffset": start, "byteLength": len(raw), "target": target})
        return len(views) - 1

    for part in parts:
        name, role, mesh = part[0], part[1], part[2]
        translation = part[3] if len(part) > 3 else None
        if not mesh.indices:
            continue
        position_view = view_for(struct.pack(f"<{len(mesh.positions)}f", *mesh.positions), 34962)
        normal_view = view_for(struct.pack(f"<{len(mesh.normals)}f", *mesh.normals), 34962)
        color_view = view_for(struct.pack(f"<{len(mesh.colors)}f", *mesh.colors), 34962)
        index_view = view_for(struct.pack(f"<{len(mesh.indices)}H", *mesh.indices), 34963)
        position_acc = len(accessors)
        accessors.extend(
            [
                {"bufferView": position_view, "componentType": 5126, "count": len(mesh.positions) // 3, "type": "VEC3"},
                {"bufferView": normal_view, "componentType": 5126, "count": len(mesh.normals) // 3, "type": "VEC3"},
                {"bufferView": color_view, "componentType": 5126, "count": len(mesh.colors) // 3, "type": "VEC3"},
                {"bufferView": index_view, "componentType": 5123, "count": len(mesh.indices), "type": "SCALAR"},
            ]
        )
        if role not in roles_seen:
            roles_seen[role] = len(materials)
            materials.append(
                {
                    "name": role,
                    "pbrMetallicRoughness": {
                        "baseColorFactor": [1, 1, 1, 1],
                        "metallicFactor": 0.8 if role == "gold" else 0,
                        "roughnessFactor": 0.35 if role == "gold" else 0.86,
                    },
                }
            )
        meshes.append(
            {
                "name": name,
                "primitives": [
                    {
                        "attributes": {"POSITION": position_acc, "NORMAL": position_acc + 1, "COLOR_0": position_acc + 2},
                        "indices": position_acc + 3,
                        "material": roles_seen[role],
                    }
                ],
            }
        )
        node = {"name": name, "mesh": len(meshes) - 1, "extras": {"role": role}}
        if translation is not None:
            node["translation"] = [translation[0], translation[1], translation[2]]
        nodes.append(node)
    gltf = {
        "asset": {"version": "2.0", "generator": "playmeet-chess-duel"},
        "scene": 0,
        "scenes": [{"nodes": list(range(len(nodes)))}],
        "nodes": nodes,
        "meshes": meshes,
        "materials": materials,
        "buffers": [{"byteLength": len(blob)}],
        "bufferViews": views,
        "accessors": accessors,
    }
    json_chunk = pad(json.dumps(gltf, separators=(",", ":")).encode("utf-8"), b" ")
    bin_chunk = bytes(blob)
    total = 12 + 8 + len(json_chunk) + 8 + len(bin_chunk)
    header = struct.pack("<III", 0x46546C67, 2, total)
    return header + struct.pack("<II", len(json_chunk), 0x4E4F534A) + json_chunk + struct.pack("<II", len(bin_chunk), 0x004E4942) + bin_chunk


def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    exports = []
    for slug, builder in PARTS:
        parts = builder()
        data = mesh_glb(parts)
        path = ROOT / f"{slug}.glb"
        path.write_bytes(data)
        tris = sum(len(part[2].indices) // 3 for part in parts)
        print(f"{slug}.glb  {tris} tris  {len(data)} bytes")
        exports.append((slug.replace("-", "_"), base64.b64encode(data).decode("ascii")))
    lines = ["/* Generated by tools/build_castle_glb.py. Real GLB bytes, not a picture. */", "export const castleModelBytes = {"]
    for key, payload in exports:
        lines.append(f"  {key}: '{payload}',")
    lines.append("} as const;")
    lines.append("")
    out = Path(__file__).resolve().parents[1] / "castle-model-bytes.ts"
    out.write_text("\n".join(lines), encoding="utf-8")
    print("wrote", out)


if __name__ == "__main__":
    main()
