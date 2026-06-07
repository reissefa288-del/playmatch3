import { FiGlobe, FiSliders, FiUsers, FiX } from 'react-icons/fi'
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion'
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
  const reduceMotion = usePrefersReducedMotion()

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="pm-home-filters__backdrop pm-sheet-backdrop-enter"
        aria-label="Filtreleri kapat"
        onClick={onClose}
      />
      <section
        className={`pm-home-filters pm-home-filters--match${reduceMotion ? '' : ' pm-sheet-modal-enter'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-match-filters-title"
        style={{ transform: 'translate(-50%, -50%)' }}
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
      </section>
    </>
  )
}
