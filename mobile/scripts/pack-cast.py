"""Pack BlockImagine GLBs into a texture-and-bone module the Expo GL scene can play."""

import base64
import json
import struct
import zlib
from pathlib import Path

SOURCE = Path(r"c:\Users\farec\Downloads\BlockImagine-Spooky-Halloween (1)\BlockImagine-Spooky-Halloween\glb")
OUT = Path(__file__).resolve().parents[1] / "src" / "features" / "deneme-2" / "scene" / "cast-data.ts"
NAMES = ["witch", "bat", "ghost", "raven"]

COMP = {5120: ("b", 1), 5121: ("B", 1), 5122: ("h", 2), 5123: ("H", 2), 5125: ("I", 4), 5126: ("f", 4)}
KIND = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}


def paeth(left: int, up: int, upper_left: int) -> int:
    estimate = left + up - upper_left
    dl, du, dul = abs(estimate - left), abs(estimate - up), abs(estimate - upper_left)
    if dl <= du and dl <= dul:
        return left
    if du <= dul:
        return up
    return upper_left


def decode_png(data: bytes) -> tuple[int, int, bytes]:
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("not a png")
    pos = 8
    width = height = bit_depth = color_type = 0
    idat = b""
    palette = b""
    transparency = b""
    while pos + 8 <= len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        kind = data[pos + 4 : pos + 8]
        chunk = data[pos + 8 : pos + 8 + length]
        if kind == b"IHDR":
            width, height, bit_depth, color_type = struct.unpack(">IIBB", chunk[:10])
        elif kind == b"PLTE":
            palette = chunk
        elif kind == b"tRNS":
            transparency = chunk
        elif kind == b"IDAT":
            idat += chunk
        elif kind == b"IEND":
            break
        pos += 12 + length
    if bit_depth != 8:
        raise ValueError(f"unsupported bit depth {bit_depth}")
    channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[color_type]
    raw = zlib.decompress(idat)
    stride = width * channels
    rows: list[bytearray] = []
    cursor = 0
    previous = bytearray(stride)
    for _ in range(height):
        filter_type = raw[cursor]
        cursor += 1
        row = bytearray(raw[cursor : cursor + stride])
        cursor += stride
        for x in range(stride):
            left = row[x - channels] if x >= channels else 0
            up = previous[x]
            upper_left = previous[x - channels] if x >= channels else 0
            if filter_type == 1:
                row[x] = (row[x] + left) & 255
            elif filter_type == 2:
                row[x] = (row[x] + up) & 255
            elif filter_type == 3:
                row[x] = (row[x] + ((left + up) // 2)) & 255
            elif filter_type == 4:
                row[x] = (row[x] + paeth(left, up, upper_left)) & 255
            elif filter_type != 0:
                raise ValueError(f"bad png filter {filter_type}")
        previous = row
        rows.append(row)
    rgba = bytearray(width * height * 4)
    for y, row in enumerate(rows):
        for x in range(width):
            i = (y * width + x) * 4
            if color_type == 6:
                rgba[i : i + 4] = row[x * 4 : x * 4 + 4]
            elif color_type == 2:
                rgba[i : i + 3] = row[x * 3 : x * 3 + 3]
                rgba[i + 3] = 255
            elif color_type == 0:
                rgba[i : i + 3] = (row[x],) * 3
                rgba[i + 3] = 255
            elif color_type == 4:
                rgba[i : i + 3] = (row[x * 2],) * 3
                rgba[i + 3] = row[x * 2 + 1]
            elif color_type == 3:
                index = row[x]
                rgba[i : i + 3] = palette[index * 3 : index * 3 + 3]
                rgba[i + 3] = transparency[index] if index < len(transparency) else 255
    return width, height, bytes(rgba)


def glb_parts(path: Path) -> tuple[dict, bytes]:
    data = path.read_bytes()
    offset = 12
    document = None
    binary = b""
    while offset + 8 <= len(data):
        chunk_len, chunk_type = struct.unpack_from("<II", data, offset)
        chunk = data[offset + 8 : offset + 8 + chunk_len]
        if chunk_type == 0x4E4F534A:
            document = json.loads(chunk)
        elif chunk_type == 0x004E4942:
            binary = chunk
        offset += 8 + chunk_len
    if document is None:
        raise ValueError(f"{path.name} has no json chunk")
    return document, binary


def read_accessor(document: dict, binary: bytes, index: int):
    accessor = document["accessors"][index]
    view = document["bufferViews"][accessor["bufferView"]]
    offset = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    count = accessor["count"]
    code, size = COMP[accessor["componentType"]]
    width = KIND[accessor["type"]]
    stride = view.get("byteStride", size * width)
    values = []
    for item in range(count):
        base = offset + item * stride
        values.append([struct.unpack_from("<" + code, binary, base + axis * size)[0] for axis in range(width)])
    return values


def rounded(values, digits=4):
    if isinstance(values[0], list):
        return [[round(float(channel), digits) for channel in row] for row in values]
    return [round(float(value), digits) for value in values]


def pack_model(name: str) -> dict:
    document, binary = glb_parts(SOURCE / f"{name}.glb")
    material = document["materials"][0]
    texture_index = material["pbrMetallicRoughness"]["baseColorTexture"]["index"]
    image_index = document["textures"][texture_index]["source"]
    image = document["images"][image_index]
    view = document["bufferViews"][image["bufferView"]]
    start = view.get("byteOffset", 0)
    png = binary[start : start + view["byteLength"]]
    width, height, rgba = decode_png(png)
    meshes = []
    for mesh in document["meshes"]:
        positions, normals, uvs, indices = [], [], [], []
        for primitive in mesh["primitives"]:
            attr = primitive["attributes"]
            pos = read_accessor(document, binary, attr["POSITION"])
            norm = read_accessor(document, binary, attr["NORMAL"]) if "NORMAL" in attr else [[0, 1, 0] for _ in pos]
            uv = read_accessor(document, binary, attr["TEXCOORD_0"]) if "TEXCOORD_0" in attr else [[0, 0] for _ in pos]
            base = len(positions)
            positions.extend(pos)
            normals.extend(norm)
            uvs.extend(uv)
            if "indices" in primitive:
                for index in read_accessor(document, binary, primitive["indices"]):
                    indices.append(int(index[0]) + base)
            else:
                indices.extend(range(base, base + len(pos)))
        meshes.append(
            {
                "position": [channel for row in rounded(positions, 3) for channel in row],
                "normal": [channel for row in rounded(normals, 3) for channel in row],
                "uv": [channel for row in rounded(uvs, 4) for channel in row],
                "index": indices,
            }
        )
    nodes = []
    for node in document["nodes"]:
        if "matrix" in node:
            raise ValueError(f"{name} uses a matrix transform")
        nodes.append(
            {
                "name": node.get("name", ""),
                "t": rounded(node.get("translation", [0, 0, 0]), 4),
                "r": rounded(node.get("rotation", [0, 0, 0, 1]), 5),
                "s": rounded(node.get("scale", [1, 1, 1]), 4),
                "mesh": node.get("mesh", -1),
                "children": node.get("children", []),
            }
        )
    animation = document["animations"][0]
    tracks = []
    duration = 0.0
    for channel in animation["channels"]:
        sampler = animation["samplers"][channel["sampler"]]
        times = [row[0] for row in read_accessor(document, binary, sampler["input"])]
        values = read_accessor(document, binary, sampler["output"])
        duration = max(duration, times[-1])
        path = channel["target"]["path"]
        tracks.append(
            {
                "node": channel["target"]["node"],
                "path": {"translation": "t", "rotation": "r", "scale": "s"}[path],
                "times": rounded(times, 4),
                "values": [channel for row in rounded(values, 5) for channel in row],
            }
        )
    opaque = sum(1 for pixel in rgba[3::4] if pixel > 10)
    print(f"{name}: {width}x{height} opaque {opaque} meshes {len(meshes)} nodes {len(nodes)} duration {duration:.2f}")
    return {
        "name": name,
        "w": width,
        "h": height,
        "tex": base64.b64encode(rgba).decode("ascii"),
        "nodes": nodes,
        "roots": document["scenes"][document.get("scene", 0)]["nodes"],
        "meshes": meshes,
        "duration": round(duration, 4),
        "tracks": tracks,
    }


def main() -> None:
    models = [pack_model(name) for name in NAMES]
    payload = json.dumps(models, separators=(",", ":"))
    OUT.write_text(
        "/* Generated by mobile/scripts/pack-cast.py from the BlockImagine CC0 pack. */\n"
        f"export const CAST: unknown = JSON.parse(`{payload}`);\n",
        encoding="utf-8",
    )
    print("wrote", OUT, "bytes", OUT.stat().st_size)


if __name__ == "__main__":
    main()
