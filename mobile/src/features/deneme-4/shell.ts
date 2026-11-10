import type { BoardShell } from '@/features/animal-tile-match/animal-tile-match-screen';

const holderPink = require('./assets/ui/holder-pink-neon.png') as number;
const holderBlue = require('./assets/ui/holder-blue-neon.png') as number;

/** Wells measured on the neon tray sheets. */
const traySlots = [
  [0.085, 0.2353, 0.18, 0.7647],
  [0.2075, 0.2353, 0.3025, 0.7647],
  [0.33, 0.2353, 0.425, 0.7647],
  [0.4525, 0.2353, 0.5475, 0.7647],
  [0.575, 0.2353, 0.67, 0.7647],
  [0.6975, 0.2353, 0.7925, 0.7647],
  [0.82, 0.2353, 0.915, 0.7647],
] as const;

const sleeve = { left: 0.2125, right: 0.7875, top: 0.0617, bottom: 0.9383 };

/** Upper arena. Same open wells as the blue half, in the pink frame color. */
const pink: BoardShell = {
  holder: holderPink,
  channel: sleeve,
  softTiles: true,
  trayAspect: 1600 / 340,
  traySlots,
};

/** Lower arena. Side sleeves stay. The bar is gone; each card has a light edge. */
const blue: BoardShell = {
  holder: holderBlue,
  channel: sleeve,
  softTiles: true,
  trayAspect: 1600 / 340,
  traySlots,
};

export const playerShell = { upper: pink, lower: blue };
