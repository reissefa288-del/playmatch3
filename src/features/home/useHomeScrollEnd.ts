import { useLayoutEffect } from 'react'

/** Stops home scroll below the premium card frame (fixed nav sits on top). */
export function useHomeScrollEnd() {
  useLayoutEffect(() => {
    const panel = document.getElementById('pm-tab-home')
    if (!panel) return

    const clamp = () => {
      const premium = panel.querySelector('.pm-premium-unlock')
      if (!premium) return

      const clearance = 20
      const premiumEl = premium as HTMLElement
      const premiumBottom = premiumEl.offsetTop + premiumEl.offsetHeight
      const maxScroll = Math.max(0, premiumBottom + clearance - panel.clientHeight)

      if (panel.scrollTop > maxScroll) {
        panel.scrollTop = maxScroll
      }
    }

    clamp()

    panel.addEventListener('scroll', clamp, { passive: true })
    const ro = new ResizeObserver(clamp)
    ro.observe(panel)
    const premium = panel.querySelector('.pm-premium-unlock')
    if (premium) ro.observe(premium)

    window.addEventListener('resize', clamp, { passive: true })

    return () => {
      panel.removeEventListener('scroll', clamp)
      window.removeEventListener('resize', clamp)
      ro.disconnect()
    }
  }, [])
}
