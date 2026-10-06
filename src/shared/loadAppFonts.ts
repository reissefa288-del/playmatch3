let fontsStarted = false

/** Render-blocking olmadan Inter yükle — FCP/LCP önceliği */
export function loadAppFonts() {
  if (fontsStarted || typeof window === 'undefined') return
  fontsStarted = true

  void import('@fontsource/inter/latin-ext-400.css')
  void import('@fontsource/inter/latin-ext-500.css')
  void import('@fontsource/inter/latin-ext-600.css')
  void import('@fontsource/inter/latin-ext-700.css')
}
