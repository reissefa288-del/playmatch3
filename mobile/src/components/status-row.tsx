import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppFont } from '@/design/font-mode';
import { colors, radius, spacing } from '@/design/tokens';

type StatusRowProps = {
  label: string;
  detail: string;
  tone?: 'muted' | 'pink';
  onPress?: () => void;
};

export function StatusRow({ label, detail, tone = 'muted', onPress }: StatusRowProps) {
  const semibold = useAppFont('semibold');
  const regular = useAppFont('regular');
  const accent = tone === 'pink' ? colors.pink : colors.textDim;

  const content = (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <View style={styles.copy}>
        <Text style={[styles.label, semibold ? { fontFamily: semibold } : null]}>{label}</Text>
        <Text style={[styles.detail, regular ? { fontFamily: regular } : null]}>{detail}</Text>
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  detail: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.72,
  },
});
