import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { useAppFont } from '@/design/font-mode';

import { checkInPlaceLabel, type CheckInPlace } from '../check-in-places';

const bar = require('../assets/cevrende-bar.png');
const pin = require('../assets/cevrende-pin.png');

type CheckInBarProps = {
  place: CheckInPlace | null;
  onOpen: () => void;
  onLeave: () => void;
};

export function CheckInBar({ place, onOpen, onLeave }: CheckInBarProps) {
  const semibold = useAppFont('semibold');

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={place ? `Çevrende, ${checkInPlaceLabel(place)}` : 'Çevrende, yakınındaki insanlar'}
        onPress={onOpen}
        style={styles.bar}
      >
        <Image source={bar} style={styles.art} contentFit="cover" />
        <Image source={pin} style={styles.pin} contentFit="contain" />
        {place ? (
          <Text style={[styles.place, semibold ? { fontFamily: semibold } : null]} numberOfLines={1}>
            {checkInPlaceLabel(place)}
          </Text>
        ) : null}
      </Pressable>
      {place ? (
        <Pressable accessibilityRole="button" onPress={onLeave} style={styles.leave}>
          <Text style={[styles.leaveText, semibold ? { fontFamily: semibold } : null]}>Ayrıl</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    flex: 1,
    height: 74,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(143, 212, 255, 0.55)',
  },
  art: {
    width: '100%',
    height: '100%',
  },
  pin: {
    position: 'absolute',
    right: 18,
    top: 8,
    width: 42,
    height: 58,
  },
  place: {
    position: 'absolute',
    left: 16,
    bottom: 8,
    right: 70,
    color: '#f7f8fc',
    fontSize: 13,
    fontWeight: '600',
  },
  leave: {
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 14, 32, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  leaveText: {
    color: '#f7f8fc',
    fontSize: 13,
    fontWeight: '600',
  },
});
