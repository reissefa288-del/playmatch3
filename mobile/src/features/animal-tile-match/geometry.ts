/** Shared with the pixel layout so coverage uses the same grid, not screen hits. */
export const TILE_STEP = 1.035;

export type TileRect = { x: number; y: number; w: number; h: number };

export function tileRect(c: number, r: number): TileRect {
  return { x: c * TILE_STEP, y: r * TILE_STEP, w: 1, h: 1 };
}

export function overlapArea(a: TileRect, b: TileRect): number {
  const width = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const height = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  if (width <= 0 || height <= 0) return 0;
  return width * height;
}
