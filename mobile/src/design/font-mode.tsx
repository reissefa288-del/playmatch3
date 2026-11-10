import { createContext, useContext, type ReactNode } from 'react';

import { font } from '@/design/tokens';

type FontMode = 'inter' | 'system';

const FontModeContext = createContext<FontMode>('system');

export function FontModeProvider({
  mode,
  children,
}: {
  mode: FontMode;
  children: ReactNode;
}) {
  return <FontModeContext.Provider value={mode}>{children}</FontModeContext.Provider>;
}

export function useAppFont(weight: keyof typeof font) {
  const mode = useContext(FontModeContext);
  if (mode === 'system') return undefined;
  return font[weight];
}
