/** Shared by the Skia tray and the tile overlay so the seven wells stay aligned. */
export const TRAY_ASPECT = 5.2;

const PAD_X = 0.042;
const GAP = 0.0125;
const SLOT_W = (1 - PAD_X * 2 - GAP * 6) / 7;
const SLOT_H = Math.min(0.66, SLOT_W * TRAY_ASPECT);
const TOP = (1 - SLOT_H) / 2;

export const traySlots: readonly (readonly [number, number, number, number])[] = Array.from({ length: 7 }, (_, index) => {
  const left = PAD_X + index * (SLOT_W + GAP);
  return [left, TOP, left + SLOT_W, TOP + SLOT_H] as const;
});
