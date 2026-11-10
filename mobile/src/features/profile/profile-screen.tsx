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

const STATS = [
  { label: 'Arkadaş', value: '0' },
  { label: 'Beğeni', value: '0' },
  { label: 'Ziyaretçi', value: '0' },
  { label: 'Ortak Match', value: '0' },
] as const;

const INTERESTS = ['Seçilmedi', 'Seçilmedi', 'Seçilmedi', 'Seçilmedi'];

const NO_ACCOUNT = 'Hesap bağlı değil. Giriş bu sürümde yok.';

export function ProfileScreen() {
  const bold = useAppFont('bold');
  const semibold = useAppFont('semibold');
  const regular = useAppFont('regular');
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <LinearGradient colors={['#070b22', '#120a30', '#1a1038']} style={styles.fill}>
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

          <View style={styles.hero}>
            <LinearGradient colors={['#241444', '#10182e']} style={styles.portrait}>
              <Text style={[styles.portraitMark, bold ? { fontFamily: bold } : null]}>P</Text>
              <Text style={styles.portraitHint}>Fotoğraf yok</Text>
            </LinearGradient>
            <LinearGradient colors={['rgba(4,8,22,0)', 'rgba(4,8,22,0.92)']} style={styles.shade} />
            <View style={styles.heroCopy}>
              <Text style={[styles.name, bold ? { fontFamily: bold } : null]}>Hesap bağlı değil</Text>
              <Text style={[styles.location, regular ? { fontFamily: regular } : null]}>Konum yok</Text>
              <View style={styles.actions}>
                <Pressable onPress={() => setNotice(NO_ACCOUNT)} style={styles.action}>
                  <Text style={styles.actionText}>Profili Gör</Text>
                </Pressable>
                <Pressable onPress={() => setEditing((open) => !open)} style={styles.action}>
                  <Text style={styles.actionText}>{editing ? 'Kapat' : 'Düzenle'}</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {editing ? (
            <View style={styles.editor}>
              <Text style={[styles.section, semibold ? { fontFamily: semibold } : null]}>
                Profil Fotoğrafları (3)
              </Text>
              <View style={styles.slots}>
                {['Ana Fotoğraf', '2. Fotoğraf', '3. Fotoğraf'].map((label) => (
                  <Pressable key={label} onPress={() => setNotice(NO_ACCOUNT)} style={styles.slot}>
                    <Text style={styles.slotPlus}>+</Text>
                    <Text style={styles.slotLabel}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.stats}>
            {STATS.map((item) => (
              <View key={item.label} style={styles.stat}>
                <Text style={[styles.statValue, bold ? { fontFamily: bold } : null]}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.level}>
            <View style={styles.levelBadge}>
              <Text style={[styles.levelNum, bold ? { fontFamily: bold } : null]}>1</Text>
            </View>
            <View style={styles.levelBody}>
              <Text style={styles.levelLabel}>Seviye · Çaylak</Text>
              <View style={styles.levelHead}>
                <Text style={[styles.levelTitle, semibold ? { fontFamily: semibold } : null]}>1</Text>
                <Text style={styles.xpTag}>XP</Text>
              </View>
              <View style={styles.bar}>
                <View style={styles.barFill} />
              </View>
              <Text style={[styles.xpLine, regular ? { fontFamily: regular } : null]}>
                0 / 5.095 XP · Oyun oyna, XP kazan
              </Text>
            </View>
          </View>

          <View style={styles.interests}>
            {INTERESTS.map((label, index) => (
              <View key={`${label}-${index}`} style={styles.interest}>
                <Text style={styles.interestMark}>—</Text>
                <Text style={styles.interestText}>{label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.about}>
            <Text style={[styles.section, semibold ? { fontFamily: semibold } : null]}>Hakkımda</Text>
            <Text style={[styles.aboutBody, regular ? { fontFamily: regular } : null]}>
              Hakkında yazılmadı. Giriş bu sürümde yok.
            </Text>
          </View>

          <View style={styles.insights}>
            <View style={styles.insight}>
              <Text style={styles.insightTitle}>Beğenilerim</Text>
              <Text style={[styles.insightValue, bold ? { fontFamily: bold } : null]}>0</Text>
              <Text style={styles.insightMeta}>Gönderilen beğeni</Text>
            </View>
            <View style={styles.insight}>
              <Text style={styles.insightTitle}>Ziyaretçilerim</Text>
              <Text style={[styles.insightValue, bold ? { fontFamily: bold } : null]}>0</Text>
              <Text style={styles.insightMeta}>Profil ziyareti</Text>
            </View>
          </View>

          <Pressable onPress={() => router.push('/premium')} style={styles.premium}>
            <Text style={[styles.premiumTitle, semibold ? { fontFamily: semibold } : null]}>Premium</Text>
            <Text style={styles.premiumBody}>Abonelik ekranını aç. Satın alma yapılmaz.</Text>
          </Pressable>

          <Pressable onPress={() => setNotice(NO_ACCOUNT)} style={styles.signOut}>
            <Text style={styles.signOutText}>Çıkış Yap</Text>
          </Pressable>
          <Pressable onPress={() => setNotice(NO_ACCOUNT)} style={styles.delete}>
            <Text style={styles.deleteText}>Hesabımı Sil</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={notice !== null} transparent animationType="fade" onRequestClose={() => setNotice(null)}>
        <View style={styles.modal}>
          <View style={styles.sheet}>
            <Text style={[styles.sheetTitle, semibold ? { fontFamily: semibold } : null]}>Profil</Text>
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
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, gap: 12 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
  hero: { height: 280, borderRadius: 24, overflow: 'hidden', backgroundColor: '#10182e' },
  portrait: { flex: 1, alignItems: 'center', paddingTop: 28, gap: 4 },
  portraitMark: { color: colors.cyan, fontSize: 42, fontWeight: '800' },
  portraitHint: { color: colors.textMuted, fontSize: 13 },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 140 },
  heroCopy: { position: 'absolute', left: 16, right: 16, bottom: 14, gap: 6 },
  name: { color: '#fff', fontSize: 26, fontWeight: '800' },
  location: { color: 'rgba(255,255,255,0.82)', fontSize: 14 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  action: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  actionText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  editor: { gap: 8 },
  section: { color: colors.text, fontSize: 16, fontWeight: '700' },
  slots: { flexDirection: 'row', gap: 8 },
  slot: {
    flex: 1,
    height: 96,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  slotPlus: { color: colors.cyan, fontSize: 22 },
  slotLabel: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
  stats: {
    flexDirection: 'row',
    borderRadius: 16,
    backgroundColor: 'rgba(16, 24, 46, 0.9)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 2 },
  statValue: { color: colors.text, fontSize: 16, fontWeight: '800' },
  statLabel: { color: colors.textDim, fontSize: 11 },
  level: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(16, 24, 46, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(98, 207, 255, 0.28)',
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12304a',
    borderWidth: 1,
    borderColor: colors.cyan,
  },
  levelNum: { color: colors.cyan, fontSize: 22, fontWeight: '800' },
  levelBody: { flex: 1, gap: 4 },
  levelLabel: { color: colors.textDim, fontSize: 12 },
  levelHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  xpTag: { color: '#ffd36a', fontSize: 12, fontWeight: '800' },
  bar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  barFill: { width: '0%', height: '100%', backgroundColor: colors.cyan },
  xpLine: { color: colors.textMuted, fontSize: 12 },
  interests: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interest: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 14,
    padding: 12,
    gap: 4,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  interestMark: { color: colors.textDim, fontSize: 16 },
  interestText: { color: colors.textMuted, fontSize: 13 },
  about: {
    borderRadius: 16,
    padding: 14,
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  aboutBody: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  insights: { flexDirection: 'row', gap: 8 },
  insight: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    gap: 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  insightTitle: { color: colors.textMuted, fontSize: 12 },
  insightValue: { color: colors.text, fontSize: 22, fontWeight: '800' },
  insightMeta: { color: colors.textDim, fontSize: 12 },
  premium: {
    borderRadius: 16,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 200, 0.4)',
    backgroundColor: 'rgba(255, 45, 143, 0.1)',
  },
  premiumTitle: { color: colors.pink, fontSize: 15, fontWeight: '700' },
  premiumBody: { color: colors.textMuted, fontSize: 13 },
  signOut: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  signOutText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  delete: { height: 44, alignItems: 'center', justifyContent: 'center' },
  deleteText: { color: '#ff8b8b', fontSize: 14, fontWeight: '600' },
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
