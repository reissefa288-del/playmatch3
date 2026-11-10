import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { useAppFont } from '@/design/font-mode';

import { BOOST_GEM_COST } from '../home-deck';

const bg = require('../assets/boost-bg.webp');
const bolt = require('../assets/boost-bolt.png');
const cta = require('../assets/boost-cta.png');
const streaks = require('../assets/boost-streaks.png');
const gem = require('../assets/gem.webp');

type BoostBannerProps = {
  onPress: () => void;
};

export function BoostBanner({ onPress }: BoostBannerProps) {
  const bold = useAppFont('bold');
  const semibold = useAppFont('semibold');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Eşleşme şansını artır, ${BOOST_GEM_COST} elmas`}
      onPress={onPress}
      style={styles.banner}
    >
      <Image source={bg} style={styles.bg} contentFit="cover" />
      <Image source={streaks} style={styles.streaks} contentFit="cover" />
      <View style={styles.inner}>
        <Image source={bolt} style={styles.bolt} contentFit="contain" />
        <View style={styles.copy}>
          <Text style={[styles.title, bold ? { fontFamily: bold } : null]}>
            Eşleşme <Text style={styles.accent}>Şansını Artır!</Text>
          </Text>
          <Text style={styles.note}>
            Daha fazla kişi seni görsün · {BOOST_GEM_COST} elmas · 10 sn
          </Text>
        </View>
        <View style={styles.cta}>
          <Image source={cta} style={styles.ctaArt} contentFit="fill" />
          <View style={styles.ctaLabel}>
            <Image source={gem} style={styles.gem} contentFit="contain" />
            <Text style={[styles.ctaText, semibold ? { fontFamily: semibold } : null]}>
              BOOST ET · {BOOST_GEM_COST} ELMAS
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 86,
    borderRadius: 18,
    overflow: 'hidden',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
  },
  streaks: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
  },
  bolt: {
    width: 46,
    height: 46,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  accent: {
    color: '#ffd36a',
  },
  note: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11,
    marginTop: 2,
  },
  cta: {
    width: 118,
    height: 36,
    justifyContent: 'center',
  },
  ctaArt: {
    ...StyleSheet.absoluteFillObject,
  },
  ctaLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 4,
  },
  gem: {
    width: 12,
    height: 12,
  },
  ctaText: {
    color: '#2a1408',
    fontSize: 8,
    fontWeight: '700',
  },
});
