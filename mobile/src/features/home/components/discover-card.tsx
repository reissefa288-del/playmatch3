import { useRef } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppFont } from '@/design/font-mode';

import type { HomeCard } from '../home-deck';

const portrait = require('../assets/portrait.webp');
const pin = require('../assets/location-pin.png');

type DiscoverCardProps = {
  card: HomeCard;
  onPass: () => void;
  onLike: () => void;
  onMenu: () => void;
};

export function DiscoverCard({ card, onPass, onLike, onMenu }: DiscoverCardProps) {
  const bold = useAppFont('bold');
  const semibold = useAppFont('semibold');
  const regular = useAppFont('regular');
  const shift = useRef(new Animated.Value(0)).current;
  const onPassRef = useRef(onPass);
  const onLikeRef = useRef(onLike);
  onPassRef.current = onPass;
  onLikeRef.current = onLike;

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: (_, gesture) => {
        shift.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -90) {
          onPassRef.current();
          shift.setValue(0);
          return;
        }
        if (gesture.dx > 90) {
          onLikeRef.current();
          shift.setValue(0);
          return;
        }
        Animated.spring(shift, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(shift, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  const rotate = shift.interpolate({
    inputRange: [-180, 0, 180],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  return (
    <Animated.View
      {...pan.panHandlers}
      style={[styles.card, { transform: [{ translateX: shift }, { rotate }] }]}
    >
      <Image
        source={card.portrait ?? portrait}
        style={styles.photo}
        contentFit="cover"
        contentPosition="top"
      />
      <LinearGradient
        colors={['rgba(4,8,22,0)', 'rgba(4,8,22,0.2)', 'rgba(4,8,22,0.92)']}
        locations={[0, 0.35, 1]}
        style={styles.vignette}
      />
      {card.online ? (
        <View style={styles.online}>
          <View style={styles.onlineDot} />
          <Text style={[styles.onlineText, semibold ? { fontFamily: semibold } : null]}>
            Çevrimiçi
          </Text>
        </View>
      ) : null}
      <View style={styles.summary}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, bold ? { fontFamily: bold } : null]} numberOfLines={1}>
            {card.name}
          </Text>
          <View style={styles.age}>
            <Text style={[styles.ageText, semibold ? { fontFamily: semibold } : null]}>
              {card.age}
            </Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Diğer" onPress={onMenu} hitSlop={8}>
            <Text style={styles.menu}>⋮</Text>
          </Pressable>
        </View>
        <View style={styles.locationRow}>
          <Image source={pin} style={styles.pin} contentFit="contain" />
          <Text style={[styles.location, regular ? { fontFamily: regular } : null]}>
            {card.distanceLabel ?? `${card.distanceKm} km`}, {card.location}
          </Text>
        </View>
        <Text style={[styles.bio, regular ? { fontFamily: regular } : null]}>{card.bio}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 430,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(120, 210, 255, 0.85)',
    backgroundColor: '#10182e',
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
  },
  vignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 210,
  },
  online: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(8, 16, 28, 0.72)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3dde8a',
  },
  onlineText: {
    color: '#f4fff8',
    fontSize: 12,
    fontWeight: '600',
  },
  summary: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    flexShrink: 1,
  },
  age: {
    minWidth: 32,
    height: 26,
    borderRadius: 8,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  ageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  menu: {
    marginLeft: 'auto',
    color: '#fff',
    fontSize: 22,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pin: {
    width: 14,
    height: 18,
  },
  location: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
  },
  bio: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 15,
    lineHeight: 20,
  },
});
