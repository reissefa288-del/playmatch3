import { BlockPuzzleScreen } from '@/features/block-puzzle/block-puzzle-screen';
import { AztecEnvironment } from '@/features/aztec-tiles/aztec-environment';

/** Aztec Tiles hosts the existing tile board on the living temple plate. */
export function AztecTilesScreen() {
  return <BlockPuzzleScreen backdrop={<AztecEnvironment />} />;
}
