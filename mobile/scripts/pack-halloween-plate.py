import base64
import shutil
from pathlib import Path

from PIL import Image

src = Path(r"C:\Users\farec\.cursor\projects\c-Users-farec-Desktop-PlayMeet\assets\halloween-night-plate.jpg")
root = Path(__file__).resolve().parents[1]
dest = root / "src/features/deneme-3/assets"
dest.mkdir(parents=True, exist_ok=True)
shutil.copyfile(src, dest / "plate.jpg")
image = Image.open(src).convert("RGBA").resize((360, 640), Image.Resampling.LANCZOS)
payload = base64.b64encode(image.tobytes()).decode("ascii")
target = root / "src/features/deneme-3/scene/plate-data.ts"
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(
    f"export const PLATE = {{ w: {image.width}, h: {image.height}, b64: '{payload}' }};\n",
    encoding="utf-8",
)
print(image.size, target.stat().st_size)
