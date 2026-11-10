import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppFont } from '@/design/font-mode';
import { colors, radius, spacing } from '@/design/tokens';

type GradientPanelProps = {
  eyebrow: string;
  title: string;
  body: string;
  colors: readonly [string, string, ...string[]];
  children?: ReactNode;
};

export function GradientPanel({
  eyebrow,
  title,
  body,
  colors: gradientColors,
  children,
}: GradientPanelProps) {
  const semibold = useAppFont('semibold');
  const bold = useAppFont('bold');
  const regular = useAppFont('regular');

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.inner}>
        <Text style={[styles.eyebrow, semibold ? { fontFamily: semibold } : null]}>{eyebrow}</Text>
        <Text style={[styles.title, bold ? { fontFamily: bold } : null]}>{title}</Text>
        <Text style={[styles.body, regular ? { fontFamily: regular } : null]}>{body}</Text>
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: radius.lg,
  },
  inner: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    opacity: 0.92,
  },
});
