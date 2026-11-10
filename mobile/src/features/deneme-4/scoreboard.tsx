import { Image } from 'expo-image';
import { useFonts } from 'expo-font';
import { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import type { MatchHud } from '@/features/animal-tile-match/animal-tile-match-screen';
import { avatarArt } from '@/features/animal-tile-match/asset-registry';

const art = require('./assets/scoreboard-given.png') as number;
const ASPECT = 1024 / 341;

export function DenemeScoreboard({ humanScore, botScore, clock }: MatchHud) {
  const { width } = useWindowDimensions();
  const boardH = (width - 8) / ASPECT;
  const [clockH, setClockH] = useState(boardH * 0.11);
  const [fontsLoaded] = useFonts({
    Manrope_600: require('./assets/Manrope-SemiBold.ttf') as number,
    Manrope_700: require('./assets/Manrope-Bold.ttf') as number,
  });
  const nameFont = fontsLoaded ? 'Manrope_600' : undefined;
  const scoreFont = fontsLoaded ? 'Manrope_700' : undefined;

  return (
    <View style={styles.board}>
      <Image source={art} contentFit="fill" style={StyleSheet.absoluteFill} />
      <View style={[styles.portrait, styles.portraitLeft]}>
        <Image source={avatarArt.maya} contentFit="cover" style={styles.portraitPhoto} />
      </View>
      <View style={[styles.portrait, styles.portraitRight]}>
        <Image source={avatarArt.berk} contentFit="cover" style={styles.portraitPhoto} />
      </View>
      <Text style={[styles.name, styles.nameLeft, { fontFamily: nameFont, fontSize: boardH * 0.072 }]} numberOfLines={1} adjustsFontSizeToFit>
        Player 1
      </Text>
      <Text style={[styles.score, styles.scoreLeft, { fontFamily: scoreFont, fontSize: boardH * 0.16 }]} numberOfLines={1} adjustsFontSizeToFit>
        {humanScore}
      </Text>
      <Text style={[styles.name, styles.nameRight, { fontFamily: nameFont, fontSize: boardH * 0.072 }]} numberOfLines={1} adjustsFontSizeToFit>
        Player 2
      </Text>
      <Text style={[styles.score, styles.scoreRight, { fontFamily: scoreFont, fontSize: boardH * 0.16 }]} numberOfLines={1} adjustsFontSizeToFit>
        {botScore}
      </Text>
      <View style={styles.clock} onLayout={(event) => setClockH(event.nativeEvent.layout.height)}>
        <Text style={[styles.clockText, { fontFamily: scoreFont, fontSize: Math.max(12, clockH * 0.74) }]} numberOfLines={1}>
          {clock}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: { width: '100%', aspectRatio: ASPECT, flexShrink: 0 },
  portrait: {
    position: 'absolute',
    width: '12.3%',
    aspectRatio: 1,
    top: '42.5%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  portraitLeft: { left: '3.32%' },
  portraitRight: { right: '3.42%' },
  portraitPhoto: { width: '100%', height: '100%', transform: [{ scale: 1.1 }] },
  name: {
    position: 'absolute',
    top: '44%',
    width: '13%',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  nameLeft: { left: '16.6%', color: '#ffe7c4' },
  nameRight: { left: '70.4%', color: '#dce8ff' },
  score: {
    position: 'absolute',
    top: '60%',
    width: '13%',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  scoreLeft: { left: '16.6%', color: '#ffd56a' },
  scoreRight: { left: '70.4%', color: '#ffe7a6' },
  clock: {
    position: 'absolute',
    left: '47.2%',
    top: '77.2%',
    width: '13.6%',
    height: '14%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockText: {
    color: '#ffe3a4',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});
