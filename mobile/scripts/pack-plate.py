import base64
from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parents[1]
image = Image.open(root / "src/features/deneme-2/assets/plate.jpg").convert("RGBA")
image = image.resize((360, 640), Image.Resampling.LANCZOS)
payload = base64.b64encode(image.tobytes()).decode("ascii")
target = root / "src/features/deneme-2/scene/plate-data.ts"
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(
    f"export const PLATE = {{ w: {image.width}, h: {image.height}, b64: '{payload}' }};\n",
    encoding="utf-8",
)
print(image.size, target.stat().st_size)
