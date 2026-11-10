import type { TileKind } from './kinds';

export type DealCell = {
  c: number;
  r: number;
  kind: TileKind;
  layer?: 0 | 1;
  /** Visible edge tiles whose animal is already part of the triple budget. */
  lock?: boolean;
};

const fillers: TileKind[] = ['bee', 'panda', 'moon', 'acorn', 'cherries', 'pig'];

/**
 * Rewrites unlocked back-layer tiles so every animal count is a multiple of 3.
 * Front faces keep the reference pyramid. Extra hidden tiles are appended when
 * the front needs more matches than the first back layer can hold.
 */
export function completeSets(cells: DealCell[]): DealCell[] {
  const open: number[] = [];
  const counts = new Map<TileKind, number>();
  cells.forEach((cell, index) => {
    const layer = cell.layer ?? 1;
    if (layer === 0 && !cell.lock) {
      open.push(index);
      return;
    }
    counts.set(cell.kind, (counts.get(cell.kind) ?? 0) + 1);
  });

  const need: TileKind[] = [];
  for (const [kind, count] of counts) {
    const extra = (3 - (count % 3)) % 3;
    for (let i = 0; i < extra; i += 1) need.push(kind);
  }
  while (need.length < open.length) {
    const kind = fillers[(need.length / 3) % fillers.length]!;
    need.push(kind, kind, kind);
  }

  const next = cells.map((cell) => ({ ...cell }));
  const anchors = open.map((index) => cells[index]!);
  open.forEach((index, slot) => {
    next[index] = { ...next[index]!, kind: need[slot]! };
  });

  for (let slot = open.length; slot < need.length; slot += 1) {
    const anchor = anchors[slot % Math.max(anchors.length, 1)] ?? cells[0]!;
    const wave = Math.floor(slot / Math.max(anchors.length, 1));
    next.push({
      c: anchor.c + 0.18 * (wave + 1),
      r: anchor.r + 0.14 * (wave + 1),
      kind: need[slot]!,
      layer: 0,
    });
  }

  const finalCounts = new Map<TileKind, number>();
  for (const cell of next) finalCounts.set(cell.kind, (finalCounts.get(cell.kind) ?? 0) + 1);
  for (const [kind, count] of finalCounts) {
    if (count % 3 !== 0) throw new Error(`Animal Tile Match deal left ${kind} at ${count}`);
  }
  return next;
}
