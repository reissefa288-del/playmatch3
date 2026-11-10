import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { useAppFont } from '@/design/font-mode';
import { colors } from '@/design/tokens';

import { type CheckInPlace } from './check-in-places';
import {
  BOOST_GEM_COST,
  DAILY_LIKES_LIMIT,
  DEFAULT_HOME_FILTERS,
  homeCards,
  type HomeFilters,
} from './home-deck';
import { ActionRow } from './components/action-row';
import { BoostBanner } from './components/boost-banner';
import { CheckInBar } from './components/check-in-bar';
import { DiscoverCard } from './components/discover-card';
import { FilterBar } from './components/filter-bar';
import { PlaceSheet } from './components/place-sheet';

const gem = require('./assets/gem.webp');

type Notice = { title: string; body: string } | null;

export function HomeScreen() {
  const semibold = useAppFont('semibold');
  const regular = useAppFont('regular');
  const [filters, setFilters] = useState<HomeFilters>(DEFAULT_HOME_FILTERS);
  const [seen, setSeen] = useState<string[]>([]);
  const [likesLeft, setLikesLeft] = useState(DAILY_LIKES_LIMIT);
  const [place, setPlace] = useState<CheckInPlace | null>(null);
  const [placesOpen, setPlacesOpen] = useState(false);
  const [superOpen, setSuperOpen] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const cards = useMemo(() => homeCards(filters), [filters]);
  const current = cards.find((card) => !seen.includes(card.id)) ?? null;
  const canUndo = seen.length > 0;

  const advance = (id: string) => setSeen((prev) => (prev.includes(id) ? prev : [...prev, id]));

  const like = () => {
    if (!current) return;
    if (likesLeft <= 0) {
      setNotice({
        title: 'Beğeni hakkın bitti',
        body: `Yarın ${DAILY_LIKES_LIMIT} yeni hak tanımlanacak.`,
      });
      return;
    }
    setLikesLeft((value) => value - 1);
    advance(current.id);
  };

  return (
    <LinearGradient colors={['#070b22', '#140c34', '#3a1468']} style={styles.fill} start={{ x: 0, y: 0.15 }} end={{ x: 1, y: 0.9 }}>
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.nav}>
            <BrandMark />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Elmas bakiyesi 0. Satın alma kapalı."
              onPress={() =>
                setNotice({
                  title: 'Elmas',
                  body: 'Bakiye 0. Satın alma bu aşamada kapalı.',
                })
              }
              style={styles.gem}
            >
              <Image source={gem} style={styles.gemIcon} contentFit="contain" />
              <Text style={[styles.gemAmount, semibold ? { fontFamily: semibold } : null]}>0</Text>
              <Text style={styles.gemPlus}>+</Text>
            </Pressable>
          </View>

          <Text style={[styles.title, semibold ? { fontFamily: semibold } : null]}>
            Yakındaki Oyuncular
          </Text>

          <FilterBar
            filters={filters}
            onChange={(next) => {
              setFilters(next);
              setSeen([]);
            }}
            onRefresh={() => setSeen([])}
          />

          {place ? (
            <View style={styles.block}>
              <CheckInBar place={place} onOpen={() => setPlacesOpen(true)} onLeave={() => setPlace(null)} />
              <EmptyCopy
                title="Henüz burada kimse yok"
                body="Şu an bu ilçede başka kimse yok. Check-in’in 3 saat açık kalır; biri gelince burada belirir."
                regular={regular}
                semibold={semibold}
              />
            </View>
          ) : current ? (
            <View style={styles.block}>
              <DiscoverCard
                key={current.id}
                card={current}
                onPass={() => advance(current.id)}
                onLike={like}
                onMenu={() =>
                  setNotice({
                    title: 'Diğer',
                    body: 'Şikayet ve engelleme bu aşamada kapalı.',
                  })
                }
              />
              <ActionRow
                canUndo={canUndo}
                canLike={likesLeft > 0}
                onUndo={() => setSeen((prev) => prev.slice(0, -1))}
                onPass={() => advance(current.id)}
                onLike={like}
                onInvite={() =>
                  setNotice({
                    title: 'Oyun daveti',
                    body: 'Düellolar bu aşamada kapalı.',
                  })
                }
                onSuperLike={() => setSuperOpen(true)}
              />
              <CheckInBar place={null} onOpen={() => setPlacesOpen(true)} onLeave={() => setPlace(null)} />
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
            <View style={styles.block}>
              <EmptyCopy
                title={cards.length === 0 ? 'Profil bulunamadı' : 'Keşif tamamlandı'}
                body={
                  cards.length === 0
                    ? 'Seçtiğin cinsiyet filtresine uygun profil yok. Filtreyi değiştirmeyi dene.'
                    : `Bugünkü ${cards.length} profili gördün. Yarın yeni oyuncular ve ${DAILY_LIKES_LIMIT} beğeni hakkı seni bekliyor.`
                }
                regular={regular}
                semibold={semibold}
              />
              <CheckInBar place={null} onOpen={() => setPlacesOpen(true)} onLeave={() => setPlace(null)} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <PlaceSheet
        visible={placesOpen}
        onClose={() => setPlacesOpen(false)}
        onPick={(next) => {
          setPlace(next);
          setPlacesOpen(false);
        }}
      />

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
                  like();
                }}
                style={[styles.sheetButton, styles.sheetButtonOn]}
              >
                <Text style={styles.sheetButtonText}>Gönder</Text>
              </Pressable>
            </View>
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

function EmptyCopy({
  title,
  body,
  regular,
  semibold,
}: {
  title: string;
  body: string;
  regular: string | undefined;
  semibold: string | undefined;
}) {
  return (
    <View style={styles.empty}>
      <Text style={[styles.emptyTitle, semibold ? { fontFamily: semibold } : null]}>{title}</Text>
      <Text style={[styles.emptyBody, regular ? { fontFamily: regular } : null]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
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
  gemIcon: {
    width: 18,
    height: 18,
  },
  gemAmount: {
    color: '#efe8ff',
    fontSize: 13,
    fontWeight: '600',
  },
  gemPlus: {
    color: '#bbb3de',
    fontSize: 16,
    marginTop: -1,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  block: {
    gap: 12,
  },
  empty: {
    borderRadius: 22,
    padding: 20,
    backgroundColor: 'rgba(16, 24, 46, 0.86)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 8,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyBody: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
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
  sheetTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  sheetBody: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
  },
  sheetButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  sheetButtonOn: {
    backgroundColor: colors.cyanDeep,
  },
  sheetButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
