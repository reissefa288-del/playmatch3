import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const COMBO_FLASH_MS = 1050

type BubbleArenaComboProps = {
  combo: number
  variant: 'p1' | 'p2'
}

export function BubbleArenaCombo({ combo, variant }: BubbleArenaComboProps) {
  const [flash, setFlash] = useState(0)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevComboRef = useRef(0)

  useEffect(() => {
    const prev = prevComboRef.current
    prevComboRef.current = combo

    if (combo < 2) {
      setFlash(0)
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
      return
    }

    if (combo <= prev) return

    setFlash(combo)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      setFlash(0)
      hideTimerRef.current = null
    }, COMBO_FLASH_MS)

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }
  }, [combo])

  const visible = flash >= 2
  const hot = flash >= 4
  const mega = flash >= 6

  return (
    <div
      className={[
        'pm-bubble-arena-combo',
        `is-${variant}`,
        hot ? 'is-hot' : '',
        mega ? 'is-mega' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-live="polite"
      aria-hidden={!visible}
    >
      <AnimatePresence>
        {visible ? (
          <motion.div
            key={`${variant}-${flash}`}
            className="pm-bubble-arena-combo__burst"
            initial={{ scale: 0.5, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: -12 }}
            transition={{
              type: 'spring',
              stiffness: 520,
              damping: 24,
            }}
          >
            <span className="pm-bubble-arena-combo__label">COMBO</span>
            <strong className="pm-bubble-arena-combo__mult">×{flash}</strong>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
