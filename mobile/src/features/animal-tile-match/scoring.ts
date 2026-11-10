/** Tune match rewards here. Gameplay reads these values and nowhere else. */
export const scoring = {
  triplePoints: 300,
  traySlots: 7,
  matchMs: 180_000,
  startingCharges: 1,
  undoHistory: 12,
} as const;
