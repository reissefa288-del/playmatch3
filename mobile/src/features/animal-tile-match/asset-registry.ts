/** Central registry for Animal Tile Match artwork. Phase 2 should import from here. */

import { type TileKind } from '@/features/animal-tile-match/kinds';

export { tileKinds, type TileKind } from '@/features/animal-tile-match/kinds';

export const tileArt: Record<TileKind, number> = {
  fox: require('./assets/tiles/hw-card-00.png') as number,
  penguin: require('./assets/tiles/hw-card-01.png') as number,
  clover: require('./assets/tiles/hw-card-02.png') as number,
  rabbit: require('./assets/tiles/hw-card-03.png') as number,
  bear: require('./assets/tiles/hw-card-04.png') as number,
  owl: require('./assets/tiles/hw-card-05.png') as number,
  whale: require('./assets/tiles/hw-card-06.png') as number,
  strawberry: require('./assets/tiles/hw-card-07.png') as number,
  frog: require('./assets/tiles/hw-card-08.png') as number,
  leaf: require('./assets/tiles/hw-card-09.png') as number,
  mushroom: require('./assets/tiles/hw-card-10.png') as number,
  star: require('./assets/tiles/hw-card-11.png') as number,
  turtle: require('./assets/tiles/hw-card-12.png') as number,
  squirrel: require('./assets/tiles/hw-card-13.png') as number,
  carrot: require('./assets/tiles/hw-card-14.png') as number,
  pig: require('./assets/tiles/hw-card-15.png') as number,
  panda: require('./assets/tiles/hw-card-16.png') as number,
  acorn: require('./assets/tiles/hw-card-17.png') as number,
  bee: require('./assets/tiles/hw-card-18.png') as number,
  cherries: require('./assets/tiles/hw-card-19.png') as number,
  cat: require('./assets/tiles/hw-card-20.png') as number,
  moon: require('./assets/tiles/hw-card-21.png') as number,
};

export const avatarArt = {
  maya: require('./assets/avatars/avatar-maya.png') as number,
  berk: require('./assets/avatars/avatar-berk.png') as number,
} as const;

export type FramePiece = 'tl' | 't' | 'tr' | 'l' | 'r' | 'bl' | 'b' | 'br';

/** Ornate 3D Aztec stone frames for the board wells and trays. */
export const halloweenArt = {
  sideWarm: require('./assets/ui/side-holder-warm.png') as number,
  sideCool: require('./assets/ui/side-holder-cool.png') as number,
  heartWarm: require('./assets/ui/heart-thin-warm.png') as number,
  heartCool: require('./assets/ui/heart-thin-cool.png') as number,
  trayWarm: require('./assets/ui/tray-slot-warm.png') as number,
  trayCool: require('./assets/ui/tray-slot-cool.png') as number,
  scoreboard: require('./assets/ui/scoreboard-empty-v1.png') as number,
  tileCard: require('./assets/ui/tile-halloween-card.png') as number,
} as const;

export const aztecFrameArt = {
  boardWarm: require('./assets/ui/frame-aztec-board-warm.png') as number,
  boardCool: require('./assets/ui/frame-aztec-board-cool.png') as number,
  trayWarm: require('./assets/ui/frame-aztec-tray-warm.png') as number,
  trayCool: require('./assets/ui/frame-aztec-tray-cool.png') as number,
} as const;

export const frameArt: Record<'pink' | 'blue', Record<FramePiece, number>> = {
  pink: {
    tl: require('./assets/ui/frame-pink-tl.png') as number,
    t: require('./assets/ui/frame-pink-t.png') as number,
    tr: require('./assets/ui/frame-pink-tr.png') as number,
    l: require('./assets/ui/frame-pink-l.png') as number,
    r: require('./assets/ui/frame-pink-r.png') as number,
    bl: require('./assets/ui/frame-pink-bl.png') as number,
    b: require('./assets/ui/frame-pink-b.png') as number,
    br: require('./assets/ui/frame-pink-br.png') as number,
  },
  blue: {
    tl: require('./assets/ui/frame-blue-tl.png') as number,
    t: require('./assets/ui/frame-blue-t.png') as number,
    tr: require('./assets/ui/frame-blue-tr.png') as number,
    l: require('./assets/ui/frame-blue-l.png') as number,
    r: require('./assets/ui/frame-blue-r.png') as number,
    bl: require('./assets/ui/frame-blue-bl.png') as number,
    b: require('./assets/ui/frame-blue-b.png') as number,
    br: require('./assets/ui/frame-blue-br.png') as number,
  },
};

export const vsArt = require('./assets/ui/vs-emblem.png') as number;

export const TRAY_SLOTS = 7;
