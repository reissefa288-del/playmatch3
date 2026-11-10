/** Shared layout tokens. Sizes that depend on the window are computed in the screen. */
export const galaxy = {
  space: '#05060e',
  red: '#ff2b4a',
  redSoft: '#ff8aa0',
  cyan: '#3ad0ff',
  cyanSoft: '#9adfff',
  text: '#f4f8ff',
  label: 'rgba(232, 240, 255, 0.78)',
  bolt: '#5ce1ff',
  shield: '#3dff8a',
  swirl: '#d07bff',
} as const;

/** Match preview defaults. Timer counts down from this; scores are live state. */
export const MATCH = {
  durationSec: 2 * 60 + 35,
  topScore: 12450,
  bottomScore: 8760,
} as const;

export type GalaxySide = 'red' | 'blue';

export function formatScore(value: number): string {
  return Math.max(0, Math.floor(value)).toLocaleString('en-US');
}

export function formatTime(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
