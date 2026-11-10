import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { useAppFont } from '@/design/font-mode';
import { colors } from '@/design/tokens';

const gem = require('../home/assets/gem.webp');

const covers = {
  brick: require('./assets/brick.webp'),
  block: require('./assets/block.webp'),
  xox: require('./assets/xox.webp'),
  memory: require('./assets/memory.webp'),
  stack: require('./assets/stack.webp'),
  math: require('./assets/math.webp'),
  color: require('./assets/color-match-duel.webp'),
  neon: require('./assets/neon.webp'),
  snake: require('./assets/snake-duel.webp'),
  pong: require('./assets/pong-duel.webp'),
  simon: require('./assets/simon-duel.webp'),
  slice: require('./assets/slice.webp'),
  chess: require('./assets/chess.webp'),
  galaxy: require('./assets/galaxy.webp'),
  mine: require('./assets/mine.webp'),
} as const;

const GAMES: { title: string; badge: string; cover: number }[] = [
  { title: 'BRICK BREAK', badge: 'Duel', cover: covers.brick },
  { title: 'CUBE DUEL', badge: 'Duel', cover: covers.block },
  { title: 'XO', badge: 'Klasik', cover: covers.xox },
  { title: 'MEMORY DUEL', badge: 'Duel', cover: covers.memory },
  { title: 'STACK DUEL', badge: 'Duel', cover: covers.stack },
  { title: 'MATH DUEL', badge: 'Duel', cover: covers.math },
  { title: 'COLOR MATCH', badge: 'Duel', cover: covers.color },
  { title: 'NEON CRUSH', badge: 'Yeni', cover: covers.neon },
  { title: 'SNAKE DUEL', badge: 'Yeni', cover: covers.snake },
  { title: 'PONG DUEL', badge: 'Duel', cover: covers.pong },
  { title: 'SIMON DUEL', badge: 'Yeni', cover: covers.simon },
  { title: 'SLICE DUEL', badge: 'Yeni', cover: covers.slice },
  { title: 'SATRANÇ DUEL', badge: 'Yeni', cover: covers.chess },
  { title: 'SPACE DUEL', badge: 'Yeni', cover: covers.galaxy },
  { title: 'RIFT WARD', badge: 'Yeni', cover: covers.galaxy },
  { title: 'DEFENDER DUEL', badge: 'Yeni', cover: covers.mine },
  { title: 'SKY ACE DUEL', badge: 'Yeni', cover: covers.galaxy },
];

const CLOSED = 'Oyunlar bu aşamada açılmıyor. Ekran yalnızca görüntü.';

export function GamesScreen() {
  const bold = useAppFont('bold');
  const semibold = useAppFont('semibold');
  const regular = useAppFont('regular');
  const [notice, setNotice] = useState<string | null>(null);
  const closed = () => setNotice(CLOSED);

  return (
    <LinearGradient colors={['#070b22', '#120a30', '#241044']} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.nav}>
            <BrandMark />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Elmas bakiyesi 0. Satın alma kapalı."
              onPress={() => setNotice('Bakiye 0. Satın alma bu aşamada kapalı.')}
              style={styles.gem}
            >
              <Image source={gem} style={styles.gemIcon} contentFit="contain" />
              <Text style={[styles.gemAmount, semibold ? { fontFamily: semibold } : null]}>0</Text>
              <Text style={styles.gemPlus}>+</Text>
            </Pressable>
          </View>

          <Text style={[styles.section, semibold ? { fontFamily: semibold } : null]}>Hızlı Oyna</Text>
          <View style={styles.ctaRow}>
            <Pressable onPress={closed} style={styles.cta}>
              <LinearGradient colors={['#ff2d8f', '#8d46ff']} style={styles.ctaFill} />
              <Text style={styles.ctaEyebrow}>Hızlı eşleşme</Text>
              <Text style={[styles.ctaTitle, bold ? { fontFamily: bold } : null]}>Rastgele{'\n'}Oyna</Text>
              <Text style={styles.ctaBody}>Karşı cinsiyetten rakiple hızlı eşleş.</Text>
              <Text style={styles.ctaButton}>Hemen Oyna</Text>
            </Pressable>
            <Pressable onPress={closed} style={styles.cta}>
              <LinearGradient colors={['#1aa8ff', '#3156ea']} style={styles.ctaFill} />
              <Text style={styles.ctaEyebrow}>Arkadaşlarınla</Text>
              <Text style={[styles.ctaTitle, bold ? { fontFamily: bold } : null]}>Özel{'\n'}Oda</Text>
              <Text style={styles.ctaBody}>Eşleştiğin oyuncuları özel odaya çağır.</Text>
              <Text style={styles.ctaButton}>Davet Et</Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kelime Çarkı oyununu aç"
            onPress={() => router.push('/word-game' as Href)}
            style={styles.wordCard}
          >
            <Text style={[styles.wordTitle, bold ? { fontFamily: bold } : null]}>Kelime Çarkı</Text>
            <Text style={[styles.wordBody, regular ? { fontFamily: regular } : null]}>
              Harfleri sürükle, kelimeyi ızgaraya yerleştir.
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ocean Kingdom Block Puzzle ekranını aç"
            onPress={() => router.push('/ocean-kingdom' as Href)}
            style={styles.oceanCard}
          >
            <Text style={[styles.wordTitle, bold ? { fontFamily: bold } : null]}>Ocean Kingdom</Text>
            <Text style={[styles.wordBody, regular ? { fontFamily: regular } : null]}>
              Sualtı krallığında Block Puzzle. Taşları yerleştir, satır ve sütun temizle.
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Deneme 4 ekranını aç"
            onPress={() => router.push('/deneme-4' as Href)}
            style={styles.denemeFourCard}
          >
            <Text style={[styles.wordTitle, bold ? { fontFamily: bold } : null]}>Deneme 4</Text>
            <Text style={[styles.wordBody, regular ? { fontFamily: regular } : null]}>
              Mor gece. Şato, ay ve taş yol.
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chess Duel ekranını aç"
            onPress={() => router.push('/chess-duel' as Href)}
            style={styles.chessCard}
          >
            <Text style={[styles.wordTitle, bold ? { fontFamily: bold } : null]}>Chess Duel</Text>
            <Text style={[styles.wordBody, regular ? { fontFamily: regular } : null]}>
              Altın tahta ve taşlar.
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Aztec Match ekranını aç"
            onPress={() => router.push('/aztec-match' as Href)}
            style={styles.aztecMatchCard}
          >
            <Text style={[styles.wordTitle, bold ? { fontFamily: bold } : null]}>Aztec Match</Text>
            <Text style={[styles.wordBody, regular ? { fontFamily: regular } : null]}>
              Aztek tapınağında Animal Tile Match. Üçlü eşleştir, skoru kap.
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Aztec Tiles ekranını aç"
            onPress={() => router.push('/aztec-tiles' as Href)}
            style={styles.aztecCard}
          >
            <Text style={[styles.wordTitle, bold ? { fontFamily: bold } : null]}>Aztec Tiles</Text>
            <Text style={[styles.wordBody, regular ? { fontFamily: regular } : null]}>
              Yaşayan Aztek ormanı. Taşları yerleştir, satır ve sütun temizle.
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Galaxy Duel ekranını aç"
            onPress={() => router.push('/galaxy-duel' as Href)}
            style={styles.galaxyCard}
          >
            <Text style={[styles.wordTitle, bold ? { fontFamily: bold } : null]}>Galaxy Duel</Text>
            <Text style={[styles.wordBody, regular ? { fontFamily: regular } : null]}>
              İki taraf da kendi bölümündeki düşmanları vurur. Canı biten kaybeder.
            </Text>
          </Pressable>

          <Text style={[styles.section, semibold ? { fontFamily: semibold } : null]}>Tüm Oyunlar</Text>
          <View style={styles.grid}>
            {GAMES.map((game) => (
              <Pressable key={game.title} onPress={closed} style={styles.card}>
                <Image source={game.cover} style={styles.cover} contentFit="cover" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{game.badge}</Text>
                </View>
                <LinearGradient colors={['rgba(4,8,22,0)', 'rgba(4,8,22,0.92)']} style={styles.shade} />
                <Text style={[styles.cardTitle, semibold ? { fontFamily: semibold } : null]} numberOfLines={2}>
                  {game.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={notice !== null} transparent animationType="fade" onRequestClose={() => setNotice(null)}>
        <View style={styles.modal}>
          <View style={styles.sheet}>
            <Text style={[styles.sheetTitle, semibold ? { fontFamily: semibold } : null]}>Oyunlar kapalı</Text>
            <Text style={[styles.sheetBody, regular ? { fontFamily: regular } : null]}>{notice}</Text>
            <Pressable onPress={() => setNotice(null)} style={styles.sheetButton}>
              <Text style={styles.sheetButtonText}>Tamam</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 12,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 17,
    backgroundColor: 'rgba(6, 11, 34, 0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },
  gemIcon: { width: 18, height: 18 },
  gemAmount: { color: '#efe8ff', fontSize: 13, fontWeight: '600' },
  gemPlus: { color: '#bbb3de', fontSize: 16 },
  section: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 6,
  },
  ctaRow: { flexDirection: 'row', gap: 10 },
  cta: {
    flex: 1,
    minHeight: 168,
    borderRadius: 20,
    overflow: 'hidden',
    padding: 14,
    justifyContent: 'flex-end',
    gap: 4,
  },
  ctaFill: { ...StyleSheet.absoluteFillObject },
  ctaEyebrow: { color: 'rgba(255,255,255,0.82)', fontSize: 11, fontWeight: '600' },
  ctaTitle: { color: '#fff', fontSize: 22, fontWeight: '800', lineHeight: 26 },
  ctaBody: { color: 'rgba(255,255,255,0.86)', fontSize: 12, lineHeight: 16 },
  wordCard: {
    borderRadius: 18,
    padding: 16,
    gap: 4,
    backgroundColor: 'rgba(255, 45, 143, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 200, 0.45)',
  },
  galaxyCard: {
    borderRadius: 18,
    padding: 16,
    gap: 4,
    backgroundColor: 'rgba(12, 16, 36, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(90, 200, 255, 0.45)',
  },
  chessCard: {
    borderRadius: 18,
    padding: 16,
    gap: 4,
    backgroundColor: 'rgba(24, 18, 48, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 74, 0.55)',
  },
  denemeFourCard: {
    borderRadius: 18,
    padding: 16,
    gap: 4,
    backgroundColor: 'rgba(58, 16, 110, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(196, 92, 255, 0.5)',
  },
  denemeThreeCard: {
    borderRadius: 18,
    padding: 16,
    gap: 4,
    backgroundColor: 'rgba(28, 16, 48, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(180, 120, 255, 0.4)',
  },
  denemeTwoCard: {
    borderRadius: 18,
    padding: 16,
    gap: 4,
    backgroundColor: 'rgba(72, 28, 18, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 150, 70, 0.45)',
  },
  denemeCard: {
    borderRadius: 18,
    padding: 16,
    gap: 4,
    backgroundColor: 'rgba(28, 18, 64, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(150, 120, 255, 0.45)',
  },
  aztecMatchCard: {
    borderRadius: 18,
    padding: 16,
    gap: 4,
    backgroundColor: 'rgba(120, 78, 16, 0.38)',
    borderWidth: 1,
    borderColor: 'rgba(244, 196, 72, 0.7)',
  },
  aztecCard: {
    borderRadius: 18,
    padding: 16,
    gap: 4,
    backgroundColor: 'rgba(92, 64, 18, 0.34)',
    borderWidth: 1,
    borderColor: 'rgba(232, 184, 74, 0.55)',
  },
  oceanCard: {
    borderRadius: 18,
    padding: 16,
    gap: 4,
    backgroundColor: 'rgba(16, 92, 128, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(120, 214, 196, 0.5)',
  },
  wordTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  wordBody: { color: colors.textMuted, fontSize: 14 },
  ctaButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    color: '#1a1030',
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  card: {
    width: '48.5%',
    height: 168,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  cover: { ...StyleSheet.absoluteFillObject },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 72 },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(8, 12, 28, 0.72)',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardTitle: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    backgroundColor: '#12182e',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  sheetTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  sheetBody: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  sheetButton: {
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cyanDeep,
  },
  sheetButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
