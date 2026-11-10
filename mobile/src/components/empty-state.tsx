import { StyleSheet, Text, View } from 'react-native';

import { useAppFont } from '@/design/font-mode';
import { colors, radius, spacing } from '@/design/tokens';

type EmptyStateProps = {
  mark: string;
  title: string;
  body: string;
};

export function EmptyState({ mark, title, body }: EmptyStateProps) {
  const bold = useAppFont('bold');
  const regular = useAppFont('regular');
  const extraBold = useAppFont('extraBold');

  return (
    <View style={styles.card}>
      <View style={styles.markWrap}>
        <Text style={[styles.mark, extraBold ? { fontFamily: extraBold } : null]}>{mark}</Text>
      </View>
      <Text style={[styles.title, bold ? { fontFamily: bold } : null]}>{title}</Text>
      <Text style={[styles.body, regular ? { fontFamily: regular } : null]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.xl,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  markWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundRaised,
    borderWidth: 1,
    borderColor: colors.cyan,
  },
  mark: {
    color: colors.cyan,
    fontSize: 18,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
});
