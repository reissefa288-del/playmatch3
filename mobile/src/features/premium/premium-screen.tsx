import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { useAppFont } from '@/design/font-mode';
import { colors } from '@/design/tokens';

const gem = require('../home/assets/gem.webp');
const chest = require('./assets/kasa.webp');

const CLOSED = 'Satın alma bu aşamada kapalı. Ödeme alınmaz, üyelik yazılmaz.';

const FEATURES: { title: string; body: string; accent: string }[] = [
  { title: 'Sınırsız Beğeni', body: 'Günlük limit yok, istediğin kadar beğen.', accent: '#ff6ec8' },
  { title: 'Görüntüleyenleri Gör', body: 'Profilini kimlerin ziyaret ettiğini keşfet.', accent: '#8d46ff' },
  { title: 'Öne Çıkarıl', body: 'Profilin öne çıkarılsın, daha fazla eşleş.', accent: '#62cfff' },
  { title: 'Okundu Bilgisi', body: 'Mesajların okunup okunmadığını gör.', accent: '#ff6ec8' },
  { title: 'Reklamsız Deneyim', body: 'Kesintisiz, saf oyun ve sohbet keyfi.', accent: '#8d46ff' },
  { title: 'Özel Rozet', body: 'Premium taç rozeti ile öne çık.', accent: '#ffd36a' },
];

const PACKAGES: {
  id: string;
  duration: string;
  price: string;
  period?: string;
  discount?: string;
  popular?: boolean;
  perks: string[];
}[] = [
  {
    id: '1m',
    duration: '1 Aylık',
    price: '₺119,99',
    period: '/ay',
    perks: ['Tüm premium özellikler', 'Anında aktivasyon'],
  },
  {
    id: '3m',
    duration: '3 Aylık',
    price: '₺299,99',
    discount: '%17 İNDİRİM',
    popular: true,
    perks: ['Tüm premium özellikler', 'En iyi değer', 'Öncelikli destek'],
  },
  {
    id: '12m',
    duration: '12 Aylık',
    price: '₺899,99',
    period: '/ay',
    perks: ['Tüm premium özellikler', 'Yıllık tasarruf'],
  },
];

export function PremiumScreen() {
  const bold = useAppFont('bold');
  const semibold = useAppFont('semibold');
  const regular = useAppFont('regular');
  const [selected, setSelected] = useState('3m');
  const [notice, setNotice] = useState<string | null>(null);
  const closed = () => setNotice(CLOSED);

  return (
    <LinearGradient colors={['#140818', '#1a0c32', '#2a1048']} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.nav}>
            <Pressable accessibilityRole="button" accessibilityLabel="Geri" onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.back}>←</Text>
            </Pressable>
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

          <View style={styles.titleRow}>
            <View style={styles.titleCopy}>
              <Text style={[styles.title, bold ? { fontFamily: bold } : null]}>Premium</Text>
              <Text style={[styles.subtitle, regular ? { fontFamily: regular } : null]}>
                Daha fazlasını keşfet, ayrıcalıkları yaşa!
              </Text>
            </View>
            <Pressable onPress={closed} style={styles.gift}>
              <Text style={[styles.giftText, semibold ? { fontFamily: semibold } : null]}>Hediye Et</Text>
            </Pressable>
          </View>

          <LinearGradient colors={['#3a1458', '#1a1038', '#120c28']} style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroTitle, bold ? { fontFamily: bold } : null]}>PlayMeet Premium</Text>
              <Text style={[styles.heroTag, regular ? { fontFamily: regular } : null]}>
                Sınırları kaldır, oyunun tadını çıkar!
              </Text>
              <Text style={styles.perk}>✓  Sınırsız beğeni ve süper güçler</Text>
              <Text style={styles.perk}>✓  Öncelikli eşleşme ve özel rozet</Text>
              <Pressable onPress={closed} style={styles.heroCta}>
                <Text style={[styles.heroCtaText, semibold ? { fontFamily: semibold } : null]}>
                  Hemen Yükselt
                </Text>
              </Pressable>
            </View>
            <Image source={chest} style={styles.chest} contentFit="contain" />
          </LinearGradient>

          <Text style={[styles.section, semibold ? { fontFamily: semibold } : null]}>
            Premium Ayrıcalıkları
          </Text>
          <View style={styles.featureGrid}>
            {FEATURES.map((feature) => (
              <View key={feature.title} style={styles.feature}>
                <View style={[styles.featureMark, { borderColor: feature.accent }]}>
                  <View style={[styles.featureDot, { backgroundColor: feature.accent }]} />
                </View>
                <Text style={[styles.featureTitle, semibold ? { fontFamily: semibold } : null]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureBody, regular ? { fontFamily: regular } : null]}>
                  {feature.body}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.section, semibold ? { fontFamily: semibold } : null]}>Premium Paketleri</Text>
          <View style={styles.packages}>
            {PACKAGES.map((pkg) => {
              const on = selected === pkg.id;
              return (
                <Pressable
                  key={pkg.id}
                  onPress={() => setSelected(pkg.id)}
                  style={[styles.package, on ? styles.packageOn : null, pkg.popular ? styles.packagePopular : null]}
                >
                  {pkg.popular ? <Text style={styles.popular}>EN POPÜLER</Text> : null}
                  {pkg.discount ? <Text style={styles.discount}>{pkg.discount}</Text> : null}
                  <Text style={[styles.duration, semibold ? { fontFamily: semibold } : null]}>{pkg.duration}</Text>
                  <Text style={[styles.price, bold ? { fontFamily: bold } : null]}>
                    {pkg.price}
                    {pkg.period ? <Text style={styles.period}>{pkg.period}</Text> : null}
                  </Text>
                  {pkg.perks.map((perk) => (
                    <Text key={perk} style={styles.packagePerk}>
                      ✓ {perk}
                    </Text>
                  ))}
                  <Text style={[styles.select, on ? styles.selectOn : null]}>{on ? 'Seçili ✓' : 'Seç'}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={closed} style={styles.upgrade}>
            <LinearGradient colors={['#ff2d8f', '#8d46ff']} style={styles.upgradeFill} />
            <Text style={[styles.upgradeText, bold ? { fontFamily: bold } : null]}>Hemen Yükselt</Text>
          </Pressable>
          <Text style={[styles.trust, regular ? { fontFamily: regular } : null]}>
            Güvenli ödeme • İstediğin zaman iptal et • %100 gizlilik
          </Text>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={notice !== null} transparent animationType="fade" onRequestClose={() => setNotice(null)}>
        <View style={styles.modal}>
          <View style={styles.sheet}>
            <Text style={[styles.sheetTitle, semibold ? { fontFamily: semibold } : null]}>Premium kapalı</Text>
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
    paddingBottom: 32,
    gap: 12,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  back: { color: colors.text, fontSize: 22, width: 28 },
  gem: {
    marginLeft: 'auto',
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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  titleCopy: { flex: 1, gap: 2 },
  title: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: colors.textMuted, fontSize: 13 },
  gift: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 200, 0.45)',
    backgroundColor: 'rgba(255, 45, 143, 0.12)',
  },
  giftText: { color: colors.pink, fontSize: 13, fontWeight: '600' },
  hero: {
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(180, 120, 255, 0.42)',
    overflow: 'hidden',
  },
  heroCopy: { flex: 1, gap: 6 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  heroTag: { color: '#f0d4ff', fontSize: 13, lineHeight: 18 },
  perk: { color: '#fff', fontSize: 13 },
  heroCta: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroCtaText: { color: '#2a1038', fontSize: 13, fontWeight: '700' },
  chest: { width: 92, height: 92 },
  section: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 6 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  feature: {
    width: '48.5%',
    borderRadius: 16,
    padding: 12,
    gap: 6,
    backgroundColor: 'rgba(16, 12, 36, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(180, 120, 255, 0.22)',
  },
  featureMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureDot: { width: 8, height: 8, borderRadius: 4 },
  featureTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  featureBody: { color: colors.textMuted, fontSize: 12, lineHeight: 16 },
  packages: { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  package: {
    flex: 1,
    borderRadius: 16,
    padding: 8,
    gap: 4,
    backgroundColor: 'rgba(8, 10, 34, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(120, 150, 255, 0.28)',
  },
  packageOn: { borderColor: '#ff6ec8' },
  packagePopular: { backgroundColor: 'rgba(40, 16, 48, 0.95)' },
  popular: { color: '#ffd36a', fontSize: 8, fontWeight: '800' },
  discount: { color: '#ff6ec8', fontSize: 9, fontWeight: '700' },
  duration: { color: colors.text, fontSize: 12, fontWeight: '700' },
  price: { color: '#fff', fontSize: 13, fontWeight: '800' },
  period: { color: colors.textMuted, fontSize: 10, fontWeight: '500' },
  packagePerk: { color: colors.textMuted, fontSize: 9, lineHeight: 12 },
  select: {
    marginTop: 4,
    textAlign: 'center',
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
    borderRadius: 10,
    overflow: 'hidden',
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  selectOn: { backgroundColor: colors.pinkDeep, color: '#fff' },
  upgrade: {
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeFill: { ...StyleSheet.absoluteFillObject },
  upgradeText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  trust: { color: colors.textDim, fontSize: 12, textAlign: 'center', lineHeight: 18 },
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
    backgroundColor: colors.pinkDeep,
  },
  sheetButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
