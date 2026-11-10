import { tileKinds, type TileKind } from '@/features/animal-tile-match/kinds';

const faces = [
  require('./assets/tiles/pumpkin.png') as number,
  require('./assets/tiles/cat.png') as number,
  require('./assets/tiles/bat.png') as number,
  require('./assets/tiles/ghost.png') as number,
  require('./assets/tiles/leaf.png') as number,
  require('./assets/tiles/cauldron.png') as number,
  require('./assets/tiles/hat.png') as number,
  require('./assets/tiles/skull.png') as number,
  require('./assets/tiles/candle.png') as number,
  require('./assets/tiles/spider.png') as number,
  require('./assets/tiles/potion.png') as number,
];

const duskFaces = [
  require('./assets/tiles/pumpkin-dusk.png') as number,
  require('./assets/tiles/cat-dusk.png') as number,
  require('./assets/tiles/bat-dusk.png') as number,
  require('./assets/tiles/ghost-dusk.png') as number,
  require('./assets/tiles/leaf-dusk.png') as number,
  require('./assets/tiles/cauldron-dusk.png') as number,
  require('./assets/tiles/hat-dusk.png') as number,
  require('./assets/tiles/skull-dusk.png') as number,
  require('./assets/tiles/candle-dusk.png') as number,
  require('./assets/tiles/spider-dusk.png') as number,
  require('./assets/tiles/potion-dusk.png') as number,
];

/** The second kind cycle keeps the same icon on a dusk card, so it cannot be mistaken for a match. */
export const denemeTileArt: Record<TileKind, number> = Object.fromEntries(
  tileKinds.map((kind, index) => [kind, (index < faces.length ? faces : duskFaces)[index % faces.length]]),
) as Record<TileKind, number>;
