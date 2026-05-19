import cv2
from pathlib import Path

video = Path(r"c:\Users\farec\Desktop\PlayMeet\.restore-ref\reference-video.mp4")
out = Path(r"c:\Users\farec\Desktop\PlayMeet\.restore-ref\frames")
out.mkdir(exist_ok=True)

cap = cv2.VideoCapture(str(video))
fps = cap.get(cv2.CAP_PROP_FPS) or 30
frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
duration = frames / fps if fps else 0
print(f"fps={fps} frames={frames} duration={duration:.1f}s")

indices = sorted(set([0] + [int(i * fps * 1.5) for i in range(int(duration / 1.5) + 1)]))
for i, idx in enumerate(indices[:15]):
    cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
    ok, frame = cap.read()
    if ok:
        path = out / f"frame_{i:02d}.jpg"
        cv2.imwrite(str(path), frame)
        print("wrote", path.name, "at", idx)
cap.release()
