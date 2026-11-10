import { useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { useAppFont } from '@/design/font-mode';

function slotCenter(index: number, count: number, size: number) {
  const radius = size * 0.33;
  const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
  return {
    x: size / 2 + Math.cos(angle) * radius,
    y: size / 2 + Math.sin(angle) * radius,
  };
}

function slotAt(x: number, y: number, count: number, size: number): number | null {
  let best = -1;
  let bestDistance = size * 0.14;
  for (let index = 0; index < count; index += 1) {
    const center = slotCenter(index, count, size);
    const distance = Math.hypot(x - center.x, y - center.y);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  }
  return best >= 0 ? best : null;
}

type LetterWheelProps = {
  letters: string[];
  selection: number[];
  onChange: (selection: number[]) => void;
  onSubmit: (selection: number[]) => void;
  size?: number;
  disabled?: boolean;
  tint?: string;
};

export function LetterWheel({
  letters,
  selection,
  onChange,
  onSubmit,
  size = 280,
  disabled = false,
  tint = '#ff2d8f',
}: LetterWheelProps) {
  const bold = useAppFont('bold');
  const chosen = useRef<number[]>([]);
  const lettersRef = useRef(letters);
  const onChangeRef = useRef(onChange);
  const onSubmitRef = useRef(onSubmit);
  const sizeRef = useRef(size);
  const disabledRef = useRef(disabled);
  lettersRef.current = letters;
  onChangeRef.current = onChange;
  onSubmitRef.current = onSubmit;
  sizeRef.current = size;
  disabledRef.current = disabled;
  const letterBox = Math.max(28, size * 0.2);

  const begin = (x: number, y: number) => {
    if (disabledRef.current) return;
    const slot = slotAt(x, y, lettersRef.current.length, sizeRef.current);
    if (slot == null) return;
    chosen.current = [slot];
    onChangeRef.current(chosen.current);
  };

  const move = (x: number, y: number) => {
    if (disabledRef.current) return;
    const slot = slotAt(x, y, lettersRef.current.length, sizeRef.current);
    if (slot == null || chosen.current.includes(slot) || chosen.current.length === 0) return;
    chosen.current = [...chosen.current, slot];
    onChangeRef.current(chosen.current);
  };

  const finish = () => {
    const path = chosen.current;
    chosen.current = [];
    onChangeRef.current([]);
    if (path.length > 0) onSubmitRef.current(path);
  };

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin((event) => {
          runOnJS(begin)(event.x, event.y);
        })
        .onUpdate((event) => {
          runOnJS(move)(event.x, event.y);
        })
        .onFinalize(() => {
          runOnJS(finish)();
        }),
    [],
  );

  return (
    <GestureDetector gesture={pan}>
      <View
        style={[styles.wheel, { width: size, height: size, borderRadius: size / 2 }]}
        accessibilityLabel="Harf çarkı"
      >
        {selection.slice(0, -1).map((slot, index) => {
          const next = selection[index + 1];
          if (next == null) return null;
          const from = slotCenter(slot, letters.length, size);
          const to = slotCenter(next, letters.length, size);
          const length = Math.hypot(to.x - from.x, to.y - from.y);
          const angle = `${Math.atan2(to.y - from.y, to.x - from.x)}rad`;
          return (
            <View
              key={`${slot}-${next}`}
              style={[
                styles.line,
                {
                  left: from.x,
                  top: from.y - 2,
                  width: length,
                  backgroundColor: tint,
                  transform: [{ rotate: angle }],
                },
              ]}
            />
          );
        })}
        {letters.map((letter, index) => {
          const center = slotCenter(index, letters.length, size);
          const active = selection.includes(index);
          return (
            <View
              key={`${letter}-${index}`}
              style={[
                styles.letter,
                active ? { backgroundColor: `${tint}29` } : null,
                {
                  left: center.x - letterBox / 2,
                  top: center.y - letterBox / 2,
                  width: letterBox,
                  height: letterBox,
                  borderRadius: letterBox / 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.letterText,
                  { fontSize: Math.max(14, letterBox * 0.5) },
                  bold ? { fontFamily: bold } : null,
                ]}
              >
                {letter}
              </Text>
            </View>
          );
        })}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wheel: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  letter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: { color: '#1a2458', fontWeight: '800' },
  line: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    transformOrigin: 'left center',
  },
});
