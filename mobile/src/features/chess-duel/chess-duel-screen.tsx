import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { BackHandler, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BOARD_FILES, BOARD_RANKS, BOARD_RATIO, BOARD_SQUARE, STARTING_RANKS, chessBoard, chessPieces } from '@/features/chess-duel/art';

/** Plain field. The palace plate and the scoreboard stay off this screen. */
export function ChessDuelScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const topLimit = insets.top + 8;
  const bottomLimit = Math.max(insets.bottom, 8) + 8;
  const roomWidth = width - 16;
  const roomHeight = height - topLimit - bottomLimit;
  const boardWidth = Math.min(roomWidth, roomHeight / BOARD_RATIO);
  const boardHeight = boardWidth * BOARD_RATIO;
  const boardLeft = (width - boardWidth) / 2;
  const boardTop = topLimit + (roomHeight - boardHeight) / 2;
  const square = boardWidth * BOARD_SQUARE;

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      router.back();
      return true;
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={styles.fill}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Image
        source={chessBoard}
        contentFit="fill"
        style={[styles.board, { width: boardWidth, height: boardHeight, left: boardLeft, top: boardTop }]}
      />
      {STARTING_RANKS.map((rank, rankIndex) =>
        [...rank].map((token, file) => {
          if (token === '.') return null;
          const piece = chessPieces[token as keyof typeof chessPieces];
          const pieceHeight = square * piece.tall;
          let pieceWidth = pieceHeight / piece.aspect;
          if (pieceWidth > square * 0.96) {
            pieceWidth = square * 0.96;
          }
          const fittedHeight = pieceWidth * piece.aspect;
          const faceIn = token === 'n' || token === 'N' ? file === 7 : false;
          return (
            <Image
              key={`${rankIndex}-${file}`}
              source={piece.source}
              contentFit="contain"
              style={{
                position: 'absolute',
                width: pieceWidth,
                height: fittedHeight,
                left: boardLeft + boardWidth * BOARD_FILES[file] - pieceWidth / 2,
                top: boardTop + boardHeight * BOARD_RANKS[rankIndex] - fittedHeight - square * 0.06,
                transform: faceIn ? [{ scaleX: -1 }] : undefined,
              }}
            />
          );
        }),
      )}
      <Pressable accessibilityLabel="Geri" onPress={() => router.back()} hitSlop={10} style={[styles.back, { top: insets.top + 4 }]}>
        <View style={styles.chevron} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#07080c' },
  board: { position: 'absolute' },
  back: {
    position: 'absolute',
    left: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    width: 12,
    height: 12,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#f4e7c8',
    transform: [{ rotate: '45deg' }],
  },
});
