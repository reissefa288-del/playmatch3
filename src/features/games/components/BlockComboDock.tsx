import { AnimatePresence, motion } from 'framer-motion'

export type BlockComboFlash = {
  text: string
  combo: number
  kind: 'combo' | 'fusion' | 'surge' | 'nova'
}

type BlockComboDockProps = {
  flash: BlockComboFlash | null
  combo: number
  fusions: number
  surges: number
}

function comboTier(combo: number) {
  if (combo >= 5) return 5
  if (combo >= 4) return 4
  if (combo >= 3) return 3
  if (combo >= 2) return 2
  return combo > 0 ? 1 : 0
}

function flashTier(flash: BlockComboFlash) {
  if (flash.kind === 'nova') return 5
  if (flash.kind === 'fusion') return 4
  if (flash.kind === 'surge') return 3
  return comboTier(flash.combo)
}

export function BlockComboDock({ flash, combo, fusions, surges }: BlockComboDockProps) {
  const tier = comboTier(combo)
  const flashTierLevel = flash ? flashTier(flash) : 0

  return (
    <section className="pm-block-combo-dock" aria-label="Küp düello durumu">
      <AnimatePresence mode="wait">
        {flash ? (
          <motion.div
            key={`${flash.kind}-${flash.combo}-${flash.text}`}
            className={`pm-block-combo-flash is-${flash.kind} is-tier-${flashTierLevel}`}
            role="status"
            initial={{ opacity: 0, scale: 0.5, y: 18 }}
            animate={{
              opacity: 1,
              scale: [0.5, 1.14, 1],
              y: [18, -6, 0],
            }}
            exit={{ opacity: 0, scale: 0.82, y: -14, filter: 'blur(3px)' }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1.2, 0.36, 1],
            }}
          >
            <span className="pm-block-combo-flash__ring" aria-hidden />
            <span className="pm-block-combo-flash__text">{flash.text}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className={`pm-block-combo-meter is-tier-${tier}${combo > 0 ? ' is-active' : ''}`}>
        <span className="pm-block-combo-meter__label">ZİNCİR</span>
        <motion.strong
          key={combo}
          className="pm-block-combo-meter__value"
          initial={{ scale: 1.45, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 520, damping: 16 }}
        >
          {combo > 0 ? `×${combo}` : '—'}
        </motion.strong>
        <span className="pm-block-combo-meter__lines">
          {fusions} füzyon · {surges} dalga
        </span>
      </div>
    </section>
  )
}
