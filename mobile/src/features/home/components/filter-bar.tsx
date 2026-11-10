import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { useAppFont } from '@/design/font-mode';
import { colors } from '@/design/tokens';

import {
  HOME_DISTANCE_OPTIONS,
  HOME_GENDER_OPTIONS,
  type HomeDistance,
  type HomeFilters,
  type HomeGender,
} from '../home-deck';

const pin = require('../assets/location-pin.png');

type FilterBarProps = {
  filters: HomeFilters;
  onChange: (next: HomeFilters) => void;
  onRefresh: () => void;
};

type OpenMenu = 'distance' | 'gender' | null;

export function FilterBar({ filters, onChange, onRefresh }: FilterBarProps) {
  const medium = useAppFont('medium');
  const [menu, setMenu] = useState<OpenMenu>(null);
  const font = medium ? { fontFamily: medium } : null;
  const genderLabel =
    HOME_GENDER_OPTIONS.find((option) => option.id === filters.gender)?.label ?? 'Cinsiyet';

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Chip
          label={`0–${filters.maxDistanceKm} km`}
          active={false}
          open={menu === 'distance'}
          font={font}
          icon={<Image source={pin} style={styles.pin} contentFit="contain" />}
          onPress={() => setMenu(menu === 'distance' ? null : 'distance')}
        />
        <Chip
          label="Çevrimiçi"
          active={filters.onlineOnly}
          open={false}
          font={font}
          onPress={() => {
            setMenu(null);
            onChange({ ...filters, onlineOnly: !filters.onlineOnly });
          }}
        />
        <Chip
          label={filters.gender === 'all' ? 'Cinsiyet' : genderLabel}
          active={filters.gender !== 'all'}
          open={menu === 'gender'}
          font={font}
          icon={<PeopleMark />}
          onPress={() => setMenu(menu === 'gender' ? null : 'gender')}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Yenile"
          onPress={() => {
            setMenu(null);
            onRefresh();
          }}
          style={styles.refresh}
        >
          <Text style={styles.refreshGlyph}>↻</Text>
        </Pressable>
      </View>

      {menu === 'distance' ? (
        <Menu
          options={HOME_DISTANCE_OPTIONS.map((km) => ({
            id: String(km),
            label: `0–${km} km`,
            selected: km === filters.maxDistanceKm,
          }))}
          onPick={(id) => {
            onChange({ ...filters, maxDistanceKm: Number(id) as HomeDistance });
            setMenu(null);
          }}
        />
      ) : null}
      {menu === 'gender' ? (
        <Menu
          options={HOME_GENDER_OPTIONS.map((option) => ({
            id: option.id,
            label: option.label,
            selected: option.id === filters.gender,
          }))}
          onPick={(id) => {
            onChange({ ...filters, gender: id as HomeGender });
            setMenu(null);
          }}
        />
      ) : null}
    </View>
  );
}

function Chip({
  label,
  active,
  open,
  font,
  icon,
  onPress,
}: {
  label: string;
  active: boolean;
  open: boolean;
  font: { fontFamily: string } | null;
  icon?: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, active || open ? styles.chipOn : null]}
    >
      {active ? <View style={styles.dot} /> : null}
      {icon}
      <Text numberOfLines={1} style={[styles.chipLabel, font, active ? styles.chipLabelOn : null]}>
        {label}
      </Text>
      <Text style={styles.chevron}>▾</Text>
    </Pressable>
  );
}

function Menu({
  options,
  onPick,
}: {
  options: { id: string; label: string; selected: boolean }[];
  onPick: (id: string) => void;
}) {
  const medium = useAppFont('medium');
  return (
    <View style={styles.menu}>
      {options.map((option) => (
        <Pressable key={option.id} onPress={() => onPick(option.id)} style={styles.menuItem}>
          <Text
            style={[
              styles.menuLabel,
              medium ? { fontFamily: medium } : null,
              option.selected ? styles.menuLabelOn : null,
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function PeopleMark() {
  return (
    <View style={styles.people}>
      <View style={styles.personBack} />
      <View style={styles.personFront} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    zIndex: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    flex: 1,
    minWidth: 0,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    backgroundColor: 'rgba(5,8,26,0.72)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  chipOn: {
    borderColor: 'rgba(255,255,255,0.72)',
  },
  chipLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  chipLabelOn: {
    color: colors.text,
  },
  chevron: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#3dde8a',
  },
  pin: {
    width: 12,
    height: 16,
  },
  refresh: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,8,26,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },
  refreshGlyph: {
    color: colors.text,
    fontSize: 18,
  },
  menu: {
    borderRadius: 16,
    backgroundColor: '#12182e',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuLabel: {
    color: colors.textMuted,
    fontSize: 15,
  },
  menuLabelOn: {
    color: colors.text,
  },
  people: {
    width: 16,
    height: 14,
  },
  personBack: {
    position: 'absolute',
    right: 0,
    top: 1,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#8d97f2',
  },
  personFront: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#b7c4ff',
  },
});
