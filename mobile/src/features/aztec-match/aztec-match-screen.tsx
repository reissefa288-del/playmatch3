import { AnimalTileMatchScreen } from '@/features/animal-tile-match/animal-tile-match-screen';
import { AztecMatchWorld } from '@/features/aztec-match/aztec-match-world';

/** Aztec Match hosts Animal Tile Match on the living temple plate. */
export function AztecMatchScreen() {
  return <AnimalTileMatchScreen backdrop={<AztecMatchWorld />} />;
}
