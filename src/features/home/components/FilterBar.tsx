import { useState } from 'react'
import { FiChevronDown, FiRotateCcw } from 'react-icons/fi'
import { HOME_DISTANCE_OPTIONS, HOME_GENDER_OPTIONS } from '../homeFilters'
import type { FilterItem, HomeDistanceKm, HomeGenderFilter } from '../types'

type FilterBarProps = {
  filters: FilterItem[]
  distanceKm: HomeDistanceKm
  gender: HomeGenderFilter
  onToggleOnline?: () => void
  onDistance: (km: HomeDistanceKm) => void
  onGender: (gender: HomeGenderFilter) => void
}

type OpenMenu = 'distance' | 'gender' | null

export function FilterBar({
  filters,
  distanceKm,
  gender,
  onToggleOnline,
  onDistance,
  onGender,
}: FilterBarProps) {
  const [menu, setMenu] = useState<OpenMenu>(null)

  return (
    <section className="pm-filter-wrap" aria-label="Filtreler">
      <div className="pm-filter-bar">
        {filters.map((filter) => {
          const menuId = filter.id === 'distance' || filter.id === 'gender' ? filter.id : null
          const open = menuId !== null && menu === menuId
          return (
            <div className="pm-filter-chip-slot" key={filter.id}>
              <button
                className={`pm-filter-chip${filter.active ? ' is-active' : ''}${open ? ' is-open' : ''} is-${filter.id}`}
                type="button"
                aria-expanded={menuId ? open : undefined}
                aria-label={
                  filter.id === 'distance' && filter.prefix
                    ? `${filter.prefix} ${filter.label}`
                    : filter.label
                }
                onClick={() => {
                  if (filter.id === 'online') {
                    setMenu(null)
                    onToggleOnline?.()
                    return
                  }
                  if (menuId) setMenu(open ? null : menuId)
                }}
              >
                {filter.active && <span className="pm-online-dot" />}
                {filter.id === 'distance' ? (
                  <svg className="pm-filter-pin" viewBox="0 0 24 32" aria-hidden>
                    <defs>
                      <linearGradient id="pm-filter-pin-fill" x1="12" y1="0" x2="12" y2="32" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#8fd0ff" />
                        <stop offset="0.55" stopColor="#4aa4ff" />
                        <stop offset="1" stopColor="#2a62f0" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#pm-filter-pin-fill)"
                      d="M12 0C5.4 0 .6 5.1.6 11.4.6 19.6 12 32 12 32s11.4-12.4 11.4-20.6C23.4 5.1 18.6 0 12 0z"
                    />
                    <circle cx="12" cy="11.2" r="4.1" fill="#07101c" />
                  </svg>
                ) : null}
                {filter.id === 'gender' ? (
                  <svg className="pm-filter-people" viewBox="0 0 72 60" aria-hidden>
                    <defs>
                      <linearGradient id="pm-filter-people-fill" x1="36" y1="6" x2="36" y2="54" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#b7c4ff" />
                        <stop offset="0.55" stopColor="#7d86f2" />
                        <stop offset="1" stopColor="#5a56e0" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="20" r="8" fill="url(#pm-filter-people-fill)" />
                    <path
                      fill="url(#pm-filter-people-fill)"
                      d="M47 40.5c0-5.6 2.8-8.6 7-8.6s7 3 7 8.6V47c0 2.2-1.6 3.8-3.8 3.8h-6.4c-2.2 0-3.8-1.6-3.8-3.8V40.5z"
                    />
                    <circle cx="26" cy="17" r="12" fill="url(#pm-filter-people-fill)" />
                    <path
                      fill="url(#pm-filter-people-fill)"
                      d="M6 38.5C6 28.8 14.2 24 26 24s20 4.8 20 14.5V48c0 3.2-2.4 5.6-5.6 5.6H11.6C8.4 53.6 6 51.2 6 48V38.5z"
                    />
                  </svg>
                ) : null}
                {filter.prefix ? <span className="pm-filter-chip__prefix">{filter.prefix}</span> : null}
                {filter.icon && <filter.icon />}
                <span className="pm-filter-chip__label">{filter.label}</span>
                <FiChevronDown />
              </button>
              {open && filter.id === 'distance' ? (
                <ChipMenu
                  label="Mesafe"
                  options={HOME_DISTANCE_OPTIONS.map((option) => ({
                    id: option.id,
                    label: `0–${option.label}`,
                  }))}
                  selected={distanceKm}
                  onClose={() => setMenu(null)}
                  onPick={(id) => {
                    onDistance(id)
                    setMenu(null)
                  }}
                />
              ) : null}
              {open && filter.id === 'gender' ? (
                <ChipMenu
                  label="Cinsiyet"
                  options={HOME_GENDER_OPTIONS}
                  selected={gender}
                  onClose={() => setMenu(null)}
                  onPick={(id) => {
                    onGender(id)
                    setMenu(null)
                  }}
                />
              ) : null}
            </div>
          )
        })}

        <button className="pm-filter-refresh" type="button" aria-label="Yenile">
          <FiRotateCcw />
        </button>
      </div>
    </section>
  )
}

function ChipMenu<T extends string | number>({
  label,
  options,
  selected,
  onPick,
  onClose,
}: {
  label: string
  options: { id: T; label: string }[]
  selected: T
  onPick: (id: T) => void
  onClose: () => void
}) {
  return (
    <>
      <button className="pm-filter-menu__backdrop" type="button" aria-label="Listeyi kapat" onClick={onClose} />
      <ul className="pm-filter-menu" role="listbox" aria-label={label}>
        {options.map((option) => (
          <li key={String(option.id)}>
            <button
              type="button"
              role="option"
              aria-selected={option.id === selected}
              className={option.id === selected ? 'is-selected' : ''}
              onClick={() => onPick(option.id)}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
