import { Image } from 'expo-image';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

const FACES = [
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

const CARD = require('./assets/card-back.png') as number;
const BLANK = require('./assets/tiles/blank.png') as number;

const BOARD_RATIO = 498 / 1024;
const TILE_RATIO = 111 / 1024;
const STACK_LEFT = 28 / 1024;
const STACK_TOP = 67 / 498;
const FACE_TOP = 324 / 498;
const CARD_STEP = 26 / 111;
const CARD_COUNT = 10;

const BACK: ReadonlyArray<readonly [number, number]> = [
  [0.28, 0.1],
  [0.4, 0.11],
  [0.6, 0.12],
  [0.72, 0.1],
  [0.22, 0.26],
  [0.46, 0.24],
  [0.66, 0.26],
  [0.34, 0.7],
  [0.62, 0.7],
  [0.46, 0.88],
  [0.56, 0.88],
];

const HEART: ReadonlyArray<readonly [number, number, number]> = [
  [0.313, 0.163, 0],
  [0.39, 0.172, 1],
  [0.608, 0.185, 2],
  [0.685, 0.161, 3],
  [0.266, 0.333, 4],
  [0.354, 0.342, 9],
  [0.5, 0.3, 6],
  [0.6, 0.345, 7],
  [0.785, 0.34, 5],
  [0.178, 0.455, 5],
  [0.297, 0.515, 9],
  [0.423, 0.505, 8],
  [0.5, 0.545, 2],
  [0.578, 0.5, 8],
  [0.708, 0.505, 6],
  [0.83, 0.485, 1],
  [0.365, 0.628, 10],
  [0.637, 0.606, 0],
  [0.445, 0.715, 5],
  [0.567, 0.697, 4],
  [0.502, 0.846, 10],
];

function Arena({
  left,
  top,
  boardW,
  boardH,
  leftFace,
  rightFace,
}: {
  left: number;
  top: number;
  boardW: number;
  boardH: number;
  leftFace: number;
  rightFace: number;
}) {
  const tile = Math.round(boardW * TILE_RATIO);
  const step = tile * CARD_STEP;
  const stackX = left + boardW * STACK_LEFT;
  const stackTop = top + boardH * STACK_TOP;
  const faceTop = top + boardH * FACE_TOP;
  const rightX = left + boardW - boardW * STACK_LEFT - tile;

  return (
    <>
      {[stackX, rightX].map((x) =>
        Array.from({ length: CARD_COUNT }, (_, index) => (
          <Image
            key={`card-${x}-${index}`}
            source={CARD}
            contentFit="fill"
            style={{
              position: 'absolute',
              left: x,
              top: stackTop + index * step,
              width: tile,
              height: tile,
              zIndex: 16 + index,
            }}
          />
        )),
      )}
      {BACK.map(([nx, ny], index) => (
        <Image
          key={`blank-${top}-${index}`}
          source={BLANK}
          contentFit="fill"
          style={{
            position: 'absolute',
            width: tile,
            height: tile,
            left: left + nx * boardW - tile / 2,
            top: top + ny * boardH - tile / 2,
            zIndex: 12,
          }}
        />
      ))}
      {HEART.map(([nx, ny, face], index) => (
        <Image
          key={`heart-${top}-${index}`}
          source={FACES[face]}
          contentFit="contain"
          style={{
            position: 'absolute',
            width: tile,
            height: tile,
            left: left + nx * boardW - tile / 2,
            top: top + ny * boardH - tile / 2,
            zIndex: 20 + index,
          }}
        />
      ))}
      <Image
        source={FACES[leftFace]}
        contentFit="contain"
        style={{ position: 'absolute', left: stackX, top: faceTop, width: tile, height: tile, zIndex: 40 }}
      />
      <Image
        source={FACES[rightFace]}
        contentFit="contain"
        style={{ position: 'absolute', left: rightX, top: faceTop, width: tile, height: tile, zIndex: 40 }}
      />
    </>
  );
}

export function TileHeart() {
  const { width, height } = useWindowDimensions();
  let boardW = width;
  let boardH = boardW * BOARD_RATIO;
  const originY = height * 0.15;
  const gap = height * 0.012;
  const limit = height * 0.78;
  const needed = originY + boardH * 2 + gap;
  if (needed > limit) {
    const fit = (limit - originY) / (boardH * 2 + gap);
    boardW *= fit;
    boardH *= fit;
  }
  const originX = (width - boardW) / 2;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Arena left={originX} top={originY} boardW={boardW} boardH={boardH} leftFace={0} rightFace={3} />
      <Arena
        left={originX}
        top={originY + boardH + gap}
        boardW={boardW}
        boardH={boardH}
        leftFace={0}
        rightFace={1}
      />
    </View>
  );
}
