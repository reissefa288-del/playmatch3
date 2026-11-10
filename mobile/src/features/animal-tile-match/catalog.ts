import { boardCells } from './board-layout';
import { createMatchFromTiles, type MatchState, type TileModel } from './engine';

function tilesFor(which: 'upper' | 'lower'): TileModel[] {
  return boardCells(which).map((slot) => ({ ...slot, removed: false }));
}

/** Upper arena is the BOT. Lower arena is the human. Same pyramid, playable triples. */
export function createAnimalMatch(): MatchState {
  return createMatchFromTiles(tilesFor('upper'), tilesFor('lower'));
}
