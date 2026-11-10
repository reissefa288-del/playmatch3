import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppFont } from '@/design/font-mode';
import { colors } from '@/design/tokens';

import {
  placeId,
  turkeyProvinces,
  type CheckInPlace,
} from '../check-in-places';

type PlaceSheetProps = {
  visible: boolean;
  onClose: () => void;
  onPick: (place: CheckInPlace) => void;
};

export function PlaceSheet({ visible, onClose, onPick }: PlaceSheetProps) {
  const semibold = useAppFont('semibold');
  const [query, setQuery] = useState('');
  const [city, setCity] = useState<string | null>(null);
  const provinces = turkeyProvinces();
  const needle = query.trim().toLocaleLowerCase('tr-TR');

  const rows = useMemo(() => {
    if (city && !needle) {
      const province = provinces.find((item) => item.name === city);
      return (province?.districts ?? []).map((district) => ({
        key: placeId(city, district),
        title: district,
        place: { id: placeId(city, district), city, district },
      }));
    }

    if (needle) {
      const matches: { key: string; title: string; place: CheckInPlace }[] = [];
      for (const province of provinces) {
        for (const district of province.districts) {
          const label = `${district}, ${province.name}`.toLocaleLowerCase('tr-TR');
          if (!label.includes(needle)) continue;
          matches.push({
            key: placeId(province.name, district),
            title: `${district}, ${province.name}`,
            place: {
              id: placeId(province.name, district),
              city: province.name,
              district,
            },
          });
          if (matches.length >= 40) return matches;
        }
      }
      return matches;
    }

    return provinces.map((province) => ({
      key: province.name,
      title: province.name,
      place: null as CheckInPlace | null,
    }));
  }, [city, needle, provinces]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.head}>
          <Pressable
            onPress={() => {
              if (city && !needle) {
                setCity(null);
                return;
              }
              onClose();
            }}
            hitSlop={8}
          >
            <Text style={styles.back}>←</Text>
          </Pressable>
          <Text style={[styles.title, semibold ? { fontFamily: semibold } : null]}>
            {city && !needle ? city : 'Çevrende'}
          </Text>
        </View>
        <TextInput
          value={query}
          onChangeText={(value) => {
            setQuery(value);
            if (value.trim()) setCity(null);
          }}
          placeholder="İl veya ilçe ara"
          placeholderTextColor={colors.textDim}
          style={styles.search}
        />
        <FlatList
          data={rows}
          keyExtractor={(item) => item.key}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => {
                if (item.place) {
                  onPick(item.place);
                  setQuery('');
                  setCity(null);
                  return;
                }
                setCity(item.title);
              }}
            >
              <Text style={styles.rowText}>{item.title}</Text>
            </Pressable>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: {
    color: colors.text,
    fontSize: 22,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 14,
    color: colors.text,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  rowText: {
    color: colors.text,
    fontSize: 16,
  },
});
