export const colors = {
  background: '#060818',
  backgroundRaised: '#0c1428',
  card: '#10182e',
  cardBorder: 'rgba(143, 212, 255, 0.22)',
  cyan: '#62cfff',
  cyanDeep: '#1aa8ff',
  blue: '#3156ea',
  violet: '#8d46ff',
  violetSoft: '#5b78ff',
  pink: '#ff6ec8',
  pinkDeep: '#ff2d8f',
  text: '#f7f8fc',
  textMuted: '#b8dcff',
  textDim: '#7f93b0',
} as const;

export const gradient = {
  hero: [colors.cyanDeep, colors.violetSoft, colors.violet] as const,
  premium: [colors.pinkDeep, colors.violet] as const,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 22,
  pill: 999,
} as const;

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
} as const;
