import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppFont } from '@/design/font-mode';

import { cellKey, gridBounds, isCellOpen, letterAt, type Cell, type PuzzleLevel, type PuzzleState } from './engine';

type PuzzleGridProps = {
  level: PuzzleLevel;
  state: PuzzleState;
  accent?: string;
  tile?: number;
};

export function PuzzleGrid({ level, state, accent = '#ff2d8f', tile = 42 }: PuzzleGridProps) {
  const bold = useAppFont('bold');
  const { rows, cols } = gridBounds(level);
  const cells = useMemo(() => {
    const drawn: Cell[] = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if (letterAt(level, { row, col })) drawn.push({ row, col });
      }
    }
    return drawn;
  }, [cols, level, rows]);

  return (
    <View style={styles.board} accessibilityLabel="Bulmaca ızgarası">
      {Array.from({ length: rows }, (_, row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: cols }, (_, col) => {
            const placed = cells.some((cell) => cell.row === row && cell.col === col);
            if (!placed) return <View key={`${row}-${col}`} style={{ width: tile, height: tile }} />;
            const open = isCellOpen(level, state, { row, col });
            const letter = open ? letterAt(level, { row, col }) : '';
            return (
              <View
                key={cellKey({ row, col })}
                style={[
                  styles.tile,
                  {
                    width: tile,
                    height: tile,
                    borderRadius: Math.max(4, tile * 0.22),
                    borderColor: accent,
                  },
                  open ? { backgroundColor: accent } : null,
                ]}
              >
                <Text
                  style={[
                    styles.letter,
                    { fontSize: Math.max(10, tile * 0.46) },
                    bold ? { fontFamily: bold } : null,
                  ]}
                >
                  {letter}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { alignItems: 'center', gap: 3 },
  row: { flexDirection: 'row', gap: 3 },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 16, 40, 0.45)',
    borderWidth: 1,
  },
  letter: { color: '#fff', fontWeight: '800' },
});
