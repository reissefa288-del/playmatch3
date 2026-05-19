import { FiChevronDown, FiRotateCcw } from 'react-icons/fi'
import type { FilterItem } from '../types'

type FilterBarProps = {
  filters: FilterItem[]
  onToggleOnline?: () => void
}

export function FilterBar({ filters, onToggleOnline }: FilterBarProps) {
  return (
    <section className="pm-filter-wrap" aria-label="Filtreler">
      <div className="pm-filter-bar">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`pm-filter-chip ${filter.active ? 'is-active' : ''}`}
            type="button"
            onClick={filter.id === 'online' ? onToggleOnline : undefined}
          >
            {filter.active && <span className="pm-online-dot" />}
            {filter.icon && <filter.icon />}
            <span>{filter.label}</span>
            <FiChevronDown />
          </button>
        ))}

        <button className="pm-filter-refresh" type="button" aria-label="Yenile">
          <FiRotateCcw />
        </button>
      </div>
    </section>
  )
}
