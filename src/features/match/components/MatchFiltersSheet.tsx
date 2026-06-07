import { FiGlobe, FiSliders, FiUsers, FiX } from 'react-icons/fi'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { MATCH_GENDER_OPTIONS } from '../matchFilters'
import type { MatchFilters } from '../types'

type MatchFiltersSheetProps = {
  open: boolean
  draft: MatchFilters
  onChange: (patch: Partial<MatchFilters>) => void
  onApply: () => void
  onReset: () => void
  onClose: () => void
}

export function MatchFiltersSheet({
  open,
  draft,
  onChange,
  onApply,
  onReset,
  onClose,
}: MatchFiltersSheetProps) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="pm-home-filters__backdrop"
            aria-label="Filtreleri kapat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            className="pm-home-filters pm-home-filters--match"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pm-match-filters-title"
            style={{ x: '-50%', y: '-50%' }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.92, x: '-50%', y: '-50%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <header className="pm-home-filters__head">
              <div>
                <FiSliders aria-hidden />
                <h2 id="pm-match-filters-title">Eşleşme filtresi</h2>
              </div>
              <button type="button" className="pm-home-filters__close" onClick={onClose} aria-label="Kapat">
                <FiX />
              </button>
            </header>

            <div className="pm-home-filters__block">
              <h3>
                <FiUsers aria-hidden /> Cinsiyet
              </h3>
              <div className="pm-home-filters__chips">
                {MATCH_GENDER_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`pm-home-filters__chip${draft.gender === option.id ? ' is-active' : ''}`}
                    onClick={() => onChange({ gender: option.id })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="pm-match-filters__scope">
              <FiGlobe aria-hidden />
              <span>
                Türkiye genelinde eşleş — farklı illerden oyuncularla eşleşebilirsin; mesafe sınırı yok.
              </span>
            </p>

            <footer className="pm-home-filters__actions">
              <button type="button" className="pm-home-filters__ghost" onClick={onReset}>
                Sıfırla
              </button>
              <button type="button" className="pm-home-filters__apply" onClick={onApply}>
                Uygula
              </button>
            </footer>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  )
}
