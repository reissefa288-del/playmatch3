import { Image } from 'expo-image';
import { useFonts } from 'expo-font';
import { StyleSheet, Text, View } from 'react-native';

import { avatarArt } from '@/features/animal-tile-match/asset-registry';

type Tone = 'pink' | 'blue';

const toneStyle = {
  pink: {
    border: 'rgba(255, 110, 196, 0.95)',
    fill: 'rgba(48, 12, 40, 0.72)',
    ring: '#ffd0ef',
    photo: avatarArt.maya,
  },
  blue: {
    border: 'rgba(90, 210, 255, 0.95)',
    fill: 'rgba(6, 24, 58, 0.72)',
    ring: '#d4f4ff',
    photo: avatarArt.berk,
  },
} as const;

/** Photo, name, and the live score, framed like the neon sleeves. */
export function PlayerBadge({ tone, name, score }: { tone: Tone; name: string; score: number }) {
  const [fontsLoaded] = useFonts({
    Manrope_600: require('./assets/Manrope-SemiBold.ttf') as number,
    Manrope_700: require('./assets/Manrope-Bold.ttf') as number,
  });
  const nameFont = fontsLoaded ? 'Manrope_600' : undefined;
  const scoreFont = fontsLoaded ? 'Manrope_700' : undefined;
  const paint = toneStyle[tone];

  return (
    <View style={[styles.card, { borderColor: paint.border, backgroundColor: paint.fill }]}>
      <View style={[styles.ring, { borderColor: paint.ring }]}>
        <Image source={paint.photo} contentFit="cover" style={styles.photo} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.name, { fontFamily: nameFont }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.score, { fontFamily: scoreFont }]} numberOfLines={1}>
          {score}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 3,
    paddingRight: 12,
    paddingVertical: 3,
    borderRadius: 28,
    borderWidth: 1.5,
  },
  ring: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  photo: { width: '100%', height: '100%', transform: [{ scale: 1.08 }] },
  copy: { alignItems: 'flex-start', minWidth: 64 },
  name: { color: '#ffe7c4', fontSize: 12, letterSpacing: 0.2 },
  score: { color: '#ffd56a', fontSize: 16, letterSpacing: 0.3, marginTop: -1 },
});
