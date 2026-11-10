import { TILE_STEP } from './geometry';
import type { TileKind } from './kinds';

/** Static preview. x/y are pixels inside the measured board. */
export type PlacedTile = {
  id: string;
  kind: TileKind;
  x: number;
  y: number;
  layer: number;
};

type Cell = { c: number; r: number; kind: TileKind; layer: number };

const STEP_RATIO = TILE_STEP;

/** Two lobes, a wide middle, and a point. Both arenas share this shape. */
const heart: readonly (readonly [number, number])[] = [
  [1, 0], [2, 0], [4, 0], [5, 0],
  [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
  [1, 3], [2, 3], [3, 3], [4, 3], [5, 3],
  [2, 4], [3, 4], [4, 4],
  [3, 5],
];

const faceKinds: TileKind[] = ['fox', 'penguin', 'clover', 'rabbit', 'bear', 'owl', 'whale', 'strawberry', 'frog'];
const backKinds: TileKind[] = ['leaf', 'mushroom', 'star', 'turtle', 'squirrel', 'carrot', 'pig', 'panda', 'acorn'];
const leftKinds: TileKind[] = ['bee', 'cherries', 'cat', 'moon', 'pig', 'panda', 'acorn'];
const rightKinds: TileKind[] = ['fox', 'penguin', 'clover', 'rabbit', 'bear', 'owl', 'whale'];
const leftStack: TileKind[] = Array.from({ length: 21 }, (_, index) => leftKinds[index % leftKinds.length]!);
const rightStack: TileKind[] = Array.from({ length: 21 }, (_, index) => rightKinds[index % rightKinds.length]!);

function heartCells(): Cell[] {
  const front = heart.map(([c, r], index) => ({ c, r, kind: faceKinds[index % faceKinds.length]!, layer: 1 }));
  const back = front.map((cell, index) => ({
    c: cell.c + 0.36,
    r: cell.r + 0.3,
    kind: backKinds[index % backKinds.length]!,
    layer: 0,
  }));
  return [...back, ...front];
}

/** A deck beside the heart. The face sits at the bottom; edges peek above it. */
function sideStack(c: number, kinds: readonly TileKind[]): Cell[] {
  const base = 4.7;
  const rise = 0.18;
  return kinds.map((kind, index) => ({
    c,
    r: base - index * rise,
    kind,
    layer: 40 - index,
  }));
}

const sharedCells: Cell[] = [...heartCells(), ...sideStack(-1.55, leftStack), ...sideStack(7.55, rightStack)];

export type LayoutOptions = { scale?: number; balanced?: boolean; maxSize?: number };

const minC = Math.min(...sharedCells.map((cell) => cell.c));
const maxC = Math.max(...sharedCells.map((cell) => cell.c));
const minR = Math.min(...sharedCells.map((cell) => cell.r));
const maxR = Math.max(...sharedCells.map((cell) => cell.r));
const SPAN_C = maxC - minC;
const SPAN_R = maxR - minR;

/** Tile size that fits a board box. Same fit the live layout uses. */
export function fitTileSize(width: number, height: number, scale = 0.82) {
  if (width < 8 || height < 8) return 0;
  const fitted = Math.min((width - 4) / (1 + SPAN_C * STEP_RATIO), (height - 4) / (1 + SPAN_R * STEP_RATIO));
  return Math.max(8, fitted * scale);
}

function boundsOf(group: PlacedTile[], size: number) {
  const left = Math.min(...group.map((tile) => tile.x));
  const right = Math.max(...group.map((tile) => tile.x)) + size;
  return { left, width: right - left };
}

function balanceGroups(tiles: PlacedTile[], size: number, width: number) {
  const minX = Math.min(...tiles.map((tile) => tile.x));
  const maxX = Math.max(...tiles.map((tile) => tile.x));
  const left = tiles.filter((tile) => tile.x < minX + size * 0.6);
  const right = tiles.filter((tile) => tile.x > maxX - size * 0.6);
  const heart = tiles.filter((tile) => !left.includes(tile) && !right.includes(tile));
  if (left.length === 0 || right.length === 0 || heart.length === 0) return;
  const leftBox = boundsOf(left, size);
  const heartBox = boundsOf(heart, size);
  const rightBox = boundsOf(right, size);
  const gap = (width - leftBox.width - heartBox.width - rightBox.width) / 4;
  const shift = (group: PlacedTile[], box: { left: number }, target: number) => {
    const delta = target - box.left;
    group.forEach((tile) => {
      tile.x += delta;
    });
  };
  shift(left, leftBox, gap);
  shift(heart, heartBox, gap + leftBox.width + gap);
  shift(right, rightBox, gap + leftBox.width + gap + heartBox.width + gap);
}

export function layoutBoard(
  which: 'upper' | 'lower',
  width: number,
  height: number,
  options?: LayoutOptions,
): { tiles: PlacedTile[]; size: number } {
  if (width < 8 || height < 8) return { tiles: [], size: 0 };
  const fitted = Math.min((width - 4) / (1 + SPAN_C * STEP_RATIO), (height - 4) / (1 + SPAN_R * STEP_RATIO));
  const scaled = fitted * (options?.scale ?? 0.82);
  const size = Math.max(8, options?.maxSize ? Math.min(scaled, options.maxSize) : scaled);
  const step = size * STEP_RATIO;
  const usedW = SPAN_C * step + size;
  const usedH = SPAN_R * step + size;
  const originX = (width - usedW) / 2 - minC * step;
  const originY = (height - usedH) / 2 - minR * step;
  const tiles = sharedCells.map((cell, index) => ({
    id: `${which}-${index}`,
    kind: cell.kind,
    x: originX + cell.c * step,
    y: originY + cell.r * step,
    layer: cell.layer,
  }));
  if (options?.balanced) balanceGroups(tiles, size, width);
  return { size, tiles };
}

export type BoardSlot = { id: string; kind: TileKind; c: number; r: number; layer: number };

export function boardCells(which: 'upper' | 'lower'): BoardSlot[] {
  return sharedCells.map((cell, index) => ({
    id: `${which}-${index}`,
    kind: cell.kind,
    c: cell.c,
    r: cell.r,
    layer: cell.layer,
  }));
}
