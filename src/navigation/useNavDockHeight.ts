import { useLayoutEffect } from 'react'

/** Keeps --pm-nav-dock-h in sync with the real fixed bottom dock height. */
export function useNavDockHeight(enabled: boolean) {
  useLayoutEffect(() => {
    if (!enabled) return

    const root = document.documentElement
    const frame = document.querySelector('.pm-app-frame') as HTMLElement | null

    const sync = () => {
      const dock = document.querySelector('.pm-nav-dock')
      const nav = dock?.querySelector('.pm-bottom-nav')
      const el = nav ?? dock
      const h = el?.getBoundingClientRect().height
      if (h && h > 0) {
        const px = `${Math.ceil(h)}px`
        root.style.setProperty('--pm-nav-dock-h', px)
        frame?.style.setProperty('--pm-nav-dock-h', px)
      }
    }

    sync()

    const ro = new ResizeObserver(sync)
    const dock = document.querySelector('.pm-nav-dock')
    if (dock) ro.observe(dock)

    window.addEventListener('resize', sync, { passive: true })

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', sync)
      root.style.removeProperty('--pm-nav-dock-h')
      frame?.style.removeProperty('--pm-nav-dock-h')
    }
  }, [enabled])
}
