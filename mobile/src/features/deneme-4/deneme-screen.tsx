import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { ReduceMotion, ReducedMotionConfig } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimalTileMatchScreen } from '@/features/animal-tile-match/animal-tile-match-screen';
import { fitTileSize } from '@/features/animal-tile-match/board-layout';
import { plate } from '@/features/deneme-4/art';
import { PlayerBadge } from '@/features/deneme-4/player-badge';
import { playerShell } from '@/features/deneme-4/shell';
import { denemeTileArt } from '@/features/deneme-4/tile-art';

export function DenemeFourScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const topInset = Math.max(insets.top, 8);
  const bottomInset = Math.max(insets.bottom, 8);
  const band = Math.round(height * 0.056);
  const upper = Math.round(height * 0.5 - band / 2);
  const lower = Math.max(0, height - upper - band);
  const badgeBand = 44;
  const trayBand = 54;
  const upperRoom = upper - topInset;
  const lowerRoom = lower - bottomInset;
  const room = Math.max(160, Math.min(upperRoom, lowerRoom));
  const upperPad = topInset + Math.max(0, upperRoom - room);
  const lowerPad = bottomInset + Math.max(0, lowerRoom - room);
  const tileCap = fitTileSize(width - 8, Math.max(120, room - badgeBand - trayBand), 1);

  return (
    <View style={styles.fill}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ReducedMotionConfig mode={ReduceMotion.Never} />
      <Image source={plate} style={StyleSheet.absoluteFill} contentFit="cover" transition={0} />
      <View style={styles.game}>
        <AnimalTileMatchScreen
          art={denemeTileArt}
          bare
          boardLayout={{ scale: 1, balanced: true, maxSize: tileCap }}
          zones={{ upper, gap: band, lower, topInset: upperPad, bottomInset: lowerPad }}
          shell={playerShell}
          rules={{ openFaces: true }}
          humanOnTop
          hud={(info) => <PlayerBadge tone="pink" name="Player 1" score={info.humanScore} />}
          lowerHud={(info) => <PlayerBadge tone="blue" name="Player 2" score={info.botScore} />}
          backdrop={<View />}
        />
      </View>
      <Pressable accessibilityLabel="Geri" onPress={() => router.back()} hitSlop={10} style={[styles.back, { top: Math.max(insets.top - 6, 8) }]}>
        <View style={styles.backChevron} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#2a1060' },
  game: { ...StyleSheet.absoluteFillObject, zIndex: 2 },
  back: {
    position: 'absolute',
    left: 12,
    top: 48,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  backChevron: {
    width: 12,
    height: 12,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#fff',
    transform: [{ rotate: '45deg' }],
  },
});
