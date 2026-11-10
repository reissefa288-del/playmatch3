import { StyleSheet, Text, View } from 'react-native';

import { useAppFont } from '@/design/font-mode';
import { colors } from '@/design/tokens';

export function BrandMark() {
  const extraBold = useAppFont('extraBold');

  return (
    <View style={styles.row}>
      <Text style={[styles.word, styles.play, extraBold ? { fontFamily: extraBold } : null]}>
        Play
      </Text>
      <Text style={[styles.word, styles.meet, extraBold ? { fontFamily: extraBold } : null]}>
        Meet
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  word: {
    fontSize: 28,
    fontStyle: 'italic',
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  play: {
    color: colors.cyan,
  },
  meet: {
    color: colors.pink,
  },
});
