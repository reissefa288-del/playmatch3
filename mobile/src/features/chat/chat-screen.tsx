import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { useAppFont } from '@/design/font-mode';
import { colors } from '@/design/tokens';

const gem = require('../home/assets/gem.webp');

export function ChatScreen() {
  const bold = useAppFont('bold');
  const semibold = useAppFont('semibold');
  const regular = useAppFont('regular');
  const [query, setQuery] = useState('');
  const [matchQuery, setMatchQuery] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const searching = query.trim().length > 0;

  return (
    <LinearGradient colors={['#070b22', '#120a30', '#1a1038']} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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

          <Text style={[styles.title, bold ? { fontFamily: bold } : null]}>Sohbet</Text>

          <View style={styles.search}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Kişi veya mesaj ara..."
              placeholderTextColor="#8a9bcf"
              accessibilityLabel="Kişi veya mesaj ara"
              style={[styles.searchInput, regular ? { fontFamily: regular } : null]}
            />
          </View>

          <View accessibilityLabel="Çevrimiçi oyuncular" style={styles.online}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Yeni Sohbet"
              onPress={() => setNewChatOpen(true)}
              style={styles.newChat}
            >
              <LinearGradient colors={['rgba(255,70,180,0.28)', 'rgba(90,60,180,0.18)']} style={styles.newIcon}>
                <Text style={styles.newPlus}>+</Text>
              </LinearGradient>
              <Text style={[styles.newLabel, semibold ? { fontFamily: semibold } : null]}>Yeni Sohbet</Text>
            </Pressable>
          </View>

          <View style={styles.empty}>
            <Text style={[styles.emptyBody, regular ? { fontFamily: regular } : null]}>
              {searching
                ? 'Aramanla eşleşen sohbet bulunamadı'
                : 'Henüz sohbet yok. Eşleştiğin kişilerle konuşmaya başla.'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={newChatOpen} transparent animationType="fade" onRequestClose={() => setNewChatOpen(false)}>
        <Pressable accessibilityLabel="Kapat" onPress={() => setNewChatOpen(false)} style={styles.backdrop}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <View style={styles.sheetHead}>
              <View style={styles.sheetTitles}>
                <Text style={[styles.sheetTitle, semibold ? { fontFamily: semibold } : null]}>Yeni Sohbet</Text>
                <Text style={[styles.sheetHint, regular ? { fontFamily: regular } : null]}>
                  Eşleştiğin kişilerden birini seç
                </Text>
              </View>
              <Pressable accessibilityLabel="Kapat" onPress={() => setNewChatOpen(false)} style={styles.close}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>
            <View style={styles.matchSearch}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                value={matchQuery}
                onChangeText={setMatchQuery}
                placeholder="Eşleşme ara..."
                placeholderTextColor="#8a9bcf"
                accessibilityLabel="Eşleşme ara"
                style={[styles.searchInput, regular ? { fontFamily: regular } : null]}
              />
            </View>
            <Text style={[styles.matchEmpty, regular ? { fontFamily: regular } : null]}>Eşleşme bulunamadı</Text>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={notice !== null} transparent animationType="fade" onRequestClose={() => setNotice(null)}>
        <View style={styles.noticeBackdrop}>
          <View style={styles.notice}>
            <Text style={[styles.sheetTitle, semibold ? { fontFamily: semibold } : null]}>Elmas</Text>
            <Text style={[styles.sheetHint, regular ? { fontFamily: regular } : null]}>{notice}</Text>
            <Pressable onPress={() => setNotice(null)} style={styles.noticeButton}>
              <Text style={styles.noticeButtonText}>Tamam</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 28, gap: 16 },
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
  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  search: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(130, 160, 255, 0.38)',
    backgroundColor: 'rgba(8, 12, 38, 0.78)',
  },
  searchIcon: { color: '#9cb6f5', fontSize: 18 },
  searchInput: { flex: 1, color: '#edf1ff', fontSize: 15, paddingVertical: 0 },
  online: { flexDirection: 'row', gap: 16, paddingVertical: 4 },
  newChat: { width: 78, alignItems: 'center', gap: 8 },
  newIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 200, 0.75)',
  },
  newPlus: { color: colors.pink, fontSize: 30, lineHeight: 34 },
  newLabel: { color: '#e0e8ff', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  empty: {
    marginTop: 8,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(130, 155, 255, 0.28)',
    backgroundColor: 'rgba(8, 12, 36, 0.45)',
  },
  emptyBody: { color: '#9eb0e8', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 4, 14, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  sheet: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 22,
    padding: 18,
    gap: 14,
    backgroundColor: '#12183c',
    borderWidth: 1,
    borderColor: 'rgba(255, 120, 200, 0.32)',
  },
  sheetHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  sheetTitles: { flex: 1, gap: 4 },
  sheetTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  sheetHint: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  closeText: { color: '#fff', fontSize: 22, lineHeight: 24 },
  matchSearch: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(130, 160, 255, 0.28)',
    backgroundColor: 'rgba(8, 12, 38, 0.78)',
  },
  matchEmpty: { color: '#9eb0e8', fontSize: 14, textAlign: 'center', paddingVertical: 18 },
  noticeBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notice: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    backgroundColor: '#12182e',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  noticeButton: {
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cyanDeep,
  },
  noticeButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
