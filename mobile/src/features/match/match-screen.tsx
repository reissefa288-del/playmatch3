import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { useAppFont } from '@/design/font-mode';
import { colors } from '@/design/tokens';

import { ActionRow } from '../home/components/action-row';
import { BoostBanner } from '../home/components/boost-banner';
import { DiscoverCard } from '../home/components/discover-card';
import {
  BOOST_GEM_COST,
  DAILY_LIKES_LIMIT,
  type HomeCard,
} from '../home/home-deck';

const gem = require('../home/assets/gem.webp');
const femalePortrait = require('../home/assets/portrait.webp');
const malePortrait = require('../home/assets/portrait-male.webp');

type MatchGender = 'female' | 'male';
type MatchTab = 'discover' | 'matches';
type Notice = { title: string; body: string } | null;

function testBot(gender: MatchGender): HomeCard {
  return {
    id: 'dev-test-bot',
    name: 'Deneme Botu',
    age: 22,
    online: true,
    distanceKm: 0,
    distanceLabel: 'Bot',
    location: 'Yerel test rakibi',
    bio: 'Bir el oynayalım mı?',
    portrait: gender === 'male' ? malePortrait : femalePortrait,
  };
}

export function MatchScreen() {
  const bold = useAppFont('bold');
  const semibold = useAppFont('semibold');
  const regular = useAppFont('regular');
  const [tab, setTab] = useState<MatchTab>('discover');
  const [appliedGender, setAppliedGender] = useState<MatchGender>('female');
  const [draftGender, setDraftGender] = useState<MatchGender>('female');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesLeft, setLikesLeft] = useState(DAILY_LIKES_LIMIT);
  const [crossedOpen, setCrossedOpen] = useState(false);
  const [superOpen, setSuperOpen] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const card = useMemo(() => testBot(appliedGender), [appliedGender]);

  const sendLike = () => {
    if (!liked && likesLeft <= 0) {
      setNotice({
        title: 'Beğeni hakkın bitti',
        body: `Yarın ${DAILY_LIKES_LIMIT} yeni hak tanımlanacak.`,
      });
      return;
    }
    if (!liked) {
      setLikesLeft((value) => value - 1);
      setLiked(true);
    }
    setSeen(true);
  };

  const likeFromList = () => {
    if (liked) return;
    if (likesLeft <= 0) {
      setNotice({
        title: 'Beğeni hakkın bitti',
        body: `Yarın ${DAILY_LIKES_LIMIT} yeni hak tanımlanacak.`,
      });
      return;
    }
    setLikesLeft((value) => value - 1);
    setLiked(true);
  };

  const undo = () => {
    if (!seen) return;
    setSeen(false);
    if (liked) {
      setLiked(false);
      setLikesLeft((value) => value + 1);
    }
  };

  return (
    <LinearGradient
      colors={['#070b22', '#120a30', '#2a1248']}
      style={styles.fill}
      start={{ x: 0, y: 0.1 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.nav}>
            <BrandMark />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Elmas bakiyesi 0. Satın alma kapalı."
              onPress={() =>
                setNotice({ title: 'Elmas', body: 'Bakiye 0. Satın alma bu aşamada kapalı.' })
              }
              style={styles.gem}
            >
              <Image source={gem} style={styles.gemIcon} contentFit="contain" />
              <Text style={[styles.gemAmount, semibold ? { fontFamily: semibold } : null]}>0</Text>
              <Text style={styles.gemPlus}>+</Text>
            </Pressable>
          </View>

          <View style={styles.head}>
            <Text style={[styles.title, bold ? { fontFamily: bold } : null]}>Eşleşme</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filtrele"
              onPress={() => {
                setDraftGender(appliedGender);
                setFiltersOpen(true);
              }}
              style={styles.filter}
            >
              <Text style={styles.filterIcon}>☰</Text>
              <Text style={[styles.filterText, semibold ? { fontFamily: semibold } : null]}>
                Filtrele
              </Text>
            </Pressable>
          </View>

          <View style={styles.tabs}>
            <TabButton
              label="Keşfet"
              active={tab === 'discover'}
              font={semibold}
              onPress={() => setTab('discover')}
            />
            <TabButton
              label="Eşleşmelerim"
              active={tab === 'matches'}
              font={semibold}
              onPress={() => setTab('matches')}
            />
          </View>

          {tab === 'discover' ? (
            <View style={styles.block}>
              {seen ? (
                <View style={styles.empty}>
                  <Text style={[styles.emptyTitle, semibold ? { fontFamily: semibold } : null]}>
                    Keşif tamamlandı
                  </Text>
                  <Text style={[styles.emptyBody, regular ? { fontFamily: regular } : null]}>
                    Bugünkü profili gördün. Yarın yeni oyuncular ve {DAILY_LIKES_LIMIT} beğeni hakkı
                    seni bekliyor.
                  </Text>
                  <Pressable onPress={undo} style={styles.undo}>
                    <Text style={styles.undoText}>Geri al</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <DiscoverCard
                    key={`${card.id}-${appliedGender}`}
                    card={card}
                    onPass={() => setSeen(true)}
                    onLike={sendLike}
                    onMenu={() =>
                      setNotice({
                        title: 'Diğer',
                        body: 'Şikayet ve engelleme bu aşamada kapalı.',
                      })
                    }
                  />
                  <ActionRow
                    canUndo={seen}
                    canLike={likesLeft > 0 && !liked}
                    onUndo={undo}
                    onPass={() => setSeen(true)}
                    onLike={sendLike}
                    onInvite={() =>
                      setNotice({ title: 'Oyun daveti', body: 'Düellolar bu aşamada kapalı.' })
                    }
                    onSuperLike={() => setSuperOpen(true)}
                  />
                </>
              )}

              <View style={styles.crossed}>
                <Text style={[styles.crossedTitle, semibold ? { fontFamily: semibold } : null]}>
                  Bugün karşılaştıkların
                </Text>
                <Pressable style={styles.crossedRow} onPress={() => setCrossedOpen(true)}>
                  <Image
                    source={card.portrait}
                    style={styles.crossedPhoto}
                    contentFit="cover"
                    contentPosition="top"
                  />
                  <View style={styles.crossedMeta}>
                    <Text style={[styles.crossedName, semibold ? { fontFamily: semibold } : null]}>
                      {card.name}, {card.age}
                    </Text>
                    <Text style={styles.crossedPlace}>{card.location}</Text>
                    <Text style={styles.crossedWhen}>1 kez karşılaştınız · Az önce</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={likeFromList}
                    disabled={liked}
                    style={styles.crossedLikeHit}
                  >
                    <Text style={styles.crossedLike}>{liked ? 'Gönderildi' : 'Beğen'}</Text>
                  </Pressable>
                </Pressable>
              </View>

              <BoostBanner
                onPress={() =>
                  setNotice({
                    title: 'Yetersiz elmas',
                    body: `Boost için ${BOOST_GEM_COST} elmas gerekir. Bakiye: 0.`,
                  })
                }
              />
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, semibold ? { fontFamily: semibold } : null]}>
                Henüz eşleşme yok
              </Text>
              <Text style={[styles.emptyBody, regular ? { fontFamily: regular } : null]}>
                Keşfet sekmesinden profilleri beğen. Karşılıklı beğeni olduğunda burada görünür.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={filtersOpen} transparent animationType="fade" onRequestClose={() => setFiltersOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.sheet}>
            <Text style={[styles.sheetTitle, semibold ? { fontFamily: semibold } : null]}>
              Eşleşme filtresi
            </Text>
            <Text style={[styles.sheetBody, regular ? { fontFamily: regular } : null]}>Cinsiyet</Text>
            <View style={styles.chips}>
              {(['female', 'male'] as const).map((gender) => (
                <Pressable
                  key={gender}
                  onPress={() => setDraftGender(gender)}
                  style={[styles.chip, draftGender === gender ? styles.chipOn : null]}
                >
                  <Text style={styles.chipText}>{gender === 'female' ? 'Kadın' : 'Erkek'}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.sheetBody, regular ? { fontFamily: regular } : null]}>
              Türkiye genelinde eşleş. Mesafe sınırı yok.
            </Text>
            <View style={styles.sheetActions}>
              <Pressable
                onPress={() => setDraftGender('female')}
                style={styles.sheetButton}
              >
                <Text style={styles.sheetButtonText}>Sıfırla</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setAppliedGender(draftGender);
                  setSeen(false);
                  setLiked(false);
                  setFiltersOpen(false);
                }}
                style={[styles.sheetButton, styles.sheetButtonOn]}
              >
                <Text style={styles.sheetButtonText}>Uygula</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={superOpen} transparent animationType="fade" onRequestClose={() => setSuperOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.sheet}>
            <Text style={[styles.sheetTitle, semibold ? { fontFamily: semibold } : null]}>Süper beğeni</Text>
            <Text style={[styles.sheetBody, regular ? { fontFamily: regular } : null]}>
              Kart öne çıkar. Eşleşme kaydı bu aşamada yazılmaz.
            </Text>
            <View style={styles.sheetActions}>
              <Pressable onPress={() => setSuperOpen(false)} style={styles.sheetButton}>
                <Text style={styles.sheetButtonText}>Vazgeç</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setSuperOpen(false);
                  sendLike();
                }}
                style={[styles.sheetButton, styles.sheetButtonOn]}
              >
                <Text style={styles.sheetButtonText}>Gönder</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={crossedOpen} transparent animationType="slide" onRequestClose={() => setCrossedOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.sheet}>
            <DiscoverCard card={card} onPass={() => undefined} onLike={() => undefined} onMenu={() => undefined} />
            <Pressable onPress={() => setCrossedOpen(false)} style={[styles.sheetButton, styles.sheetButtonOn]}>
              <Text style={styles.sheetButtonText}>Kapat</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={notice !== null} transparent animationType="fade" onRequestClose={() => setNotice(null)}>
        <View style={styles.modal}>
          <View style={styles.sheet}>
            <Text style={[styles.sheetTitle, semibold ? { fontFamily: semibold } : null]}>{notice?.title}</Text>
            <Text style={[styles.sheetBody, regular ? { fontFamily: regular } : null]}>{notice?.body}</Text>
            <Pressable onPress={() => setNotice(null)} style={[styles.sheetButton, styles.sheetButtonOn]}>
              <Text style={styles.sheetButtonText}>Tamam</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

function TabButton({
  label,
  active,
  font,
  onPress,
}: {
  label: string;
  active: boolean;
  font: string | undefined;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={styles.tab}>
      {active ? (
        <LinearGradient
          colors={['rgba(255,75,185,0.28)', 'rgba(90,60,180,0.14)']}
          style={styles.tabOn}
        />
      ) : null}
      <Text style={[styles.tabLabel, font ? { fontFamily: font } : null, active ? styles.tabLabelOn : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 14,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  gemPlus: { color: '#bbb3de', fontSize: 16, marginTop: -1 },
  head: {
    minHeight: 44,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
    paddingRight: 110,
  },
  filter: {
    position: 'absolute',
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(132, 164, 255, 0.4)',
    backgroundColor: 'rgba(8, 12, 38, 0.78)',
  },
  filterIcon: { color: '#e4ecff', fontSize: 14 },
  filterText: { color: '#e4ecff', fontSize: 13, fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    gap: 6,
    padding: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(6, 10, 32, 0.72)',
  },
  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabOn: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 120, 210, 0.62)',
  },
  tabLabel: { color: '#9aa6d4', fontSize: 13, fontWeight: '600' },
  tabLabelOn: { color: '#ffe9fb' },
  block: { gap: 12 },
  empty: {
    borderRadius: 22,
    padding: 20,
    gap: 8,
    backgroundColor: 'rgba(16, 24, 46, 0.86)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  emptyBody: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  undo: { alignSelf: 'flex-start', marginTop: 4 },
  undoText: { color: colors.cyan, fontSize: 14, fontWeight: '600' },
  crossed: { gap: 8 },
  crossedTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  crossedEmpty: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  crossedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 24, 46, 0.86)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  crossedPhoto: { width: 52, height: 52, borderRadius: 26 },
  crossedMeta: { flex: 1, gap: 2 },
  crossedName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  crossedPlace: { color: colors.textMuted, fontSize: 13 },
  crossedWhen: { color: colors.textDim, fontSize: 12 },
  crossedLike: { color: colors.pink, fontSize: 13, fontWeight: '600' },
  crossedLikeHit: { paddingHorizontal: 4, paddingVertical: 8 },
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
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chipOn: { borderColor: colors.pink, backgroundColor: 'rgba(255, 45, 143, 0.18)' },
  chipText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  sheetActions: { flexDirection: 'row', gap: 10 },
  sheetButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  sheetButtonOn: { backgroundColor: colors.cyanDeep },
  sheetButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
