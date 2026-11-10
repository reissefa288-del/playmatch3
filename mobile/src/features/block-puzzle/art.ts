/* Metro resolves static images through require(). */
/* eslint-disable @typescript-eslint/no-require-imports */

import type { TileId } from '@/features/block-puzzle/engine';

export const background = require('./assets/backgrounds/salon.jpg') as number;
export const plaque = require('./assets/ui/banner.png') as number;
export const scoreWord = require('./assets/ui/score-word.png') as number;
export const boardFrame = require('./assets/ui/board-table.png') as number;
export const trayFrame = require('./assets/ui/tray-slots.png') as number;
export const emptyCell = require('./assets/ui/cell.png') as number;
export const comma = require('./assets/ui/digits/comma.png') as number;
export const hudBarPink = require('./assets/ui/hud-bar-pink.png') as number;
export const hudBarCyan = require('./assets/ui/hud-bar-cyan.png') as number;
export const boardFramePink = require('./assets/ui/board-frame-pink.png') as number;
export const boardFrameCyan = require('./assets/ui/board-frame-cyan.png') as number;
export const boardWells = require('./assets/ui/board-wells.png') as number;
export const playmeetLogo = require('./assets/ui/playmeet-logo.png') as number;
export const blockPuzzleLogo = require('./assets/ui/block-puzzle-logo.png') as number;

export const trayFramePink = require('./assets/ui/tray-frame-pink.png') as number;
export const trayFrameCyan = require('./assets/ui/tray-frame-cyan.png') as number;

/** Combined board + tray oceanic frame (pink / cyan). Interiors are transparent. */
export const arenaComboPink = require('./assets/ui/arena-combo-pink.png') as number;
export const arenaComboCyan = require('./assets/ui/arena-combo-cyan.png') as number;
export const ARENA_COMBO_ASPECT = 1024 / 847;
/** Normalized hole rects inside the combo frame: left/top/right/bottom. */
export const ARENA_BOARD_HOLE = { l: 0.097, t: 0.152, r: 0.729, b: 0.882 } as const;
export const ARENA_TRAY_HOLE = { l: 0.778, t: 0.172, r: 0.968, b: 0.847 } as const;
export const vsDivider = require('./assets/ui/vs-divider.png') as number;
export const vsCrest = require('./assets/ui/vs-crest.png') as number;


export const DIGITS: Record<string, number> = {
  '0': require('./assets/ui/digits/0.png'),
  '1': require('./assets/ui/digits/1.png'),
  '2': require('./assets/ui/digits/2.png'),
  '3': require('./assets/ui/digits/3.png'),
  '4': require('./assets/ui/digits/4.png'),
  '5': require('./assets/ui/digits/5.png'),
  '6': require('./assets/ui/digits/6.png'),
  '7': require('./assets/ui/digits/7.png'),
  '8': require('./assets/ui/digits/8.png'),
  '9': require('./assets/ui/digits/9.png'),
};

export const TILE_ART: Record<TileId, number> = {
  ruby: require('./assets/tiles/ruby.png'),
  sapphire: require('./assets/tiles/sapphire.png'),
  emerald: require('./assets/tiles/emerald.png'),
  amethyst: require('./assets/tiles/amethyst.png'),
  amber: require('./assets/tiles/amber.png'),
};
