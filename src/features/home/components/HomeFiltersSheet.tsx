import { FiMapPin, FiSliders, FiUsers, FiX } from 'react-icons/fi'
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion'
import { HOME_DISTANCE_OPTIONS, HOME_GENDER_OPTIONS } from '../homeFilters'
import type { HomeFilters } from '../types'

type HomeFiltersSheetProps = {
  open: boolean
  draft: HomeFilters
  onChange: (patch: Partial<HomeFilters>) => void
  onApply: () => void
  onReset: () => void
  onClose: () => void
}

export function HomeFiltersSheet({
  open,
  draft,
  onChange,
  onApply,
  onReset,
  onClose,
}: HomeFiltersSheetProps) {
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
        className={`pm-home-filters${reduceMotion ? '' : ' pm-sheet-modal-enter'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-home-filters-title"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <header className="pm-home-filters__head">
          <div>
            <FiSliders aria-hidden />
            <h2 id="pm-home-filters-title">Filtrele</h2>
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
            {HOME_GENDER_OPTIONS.map((option) => (
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

        <div className="pm-home-filters__block">
          <h3>
            <FiMapPin aria-hidden /> Maksimum mesafe
          </h3>
          <div className="pm-home-filters__chips">
            {HOME_DISTANCE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`pm-home-filters__chip${draft.maxDistanceKm === option.id ? ' is-active' : ''}`}
                onClick={() => onChange({ maxDistanceKm: option.id })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <label className="pm-home-filters__toggle">
          <input
            type="checkbox"
            checked={draft.onlineOnly}
            onChange={(e) => onChange({ onlineOnly: e.target.checked })}
          />
          <span>Sadece çevrimiçi oyuncular</span>
        </label>

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
