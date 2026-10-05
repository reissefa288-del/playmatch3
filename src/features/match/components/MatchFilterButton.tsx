import { FiSliders } from 'react-icons/fi'
type MatchFilterButtonProps = {
  onClick: () => void
}

export function MatchFilterButton({ onClick }: MatchFilterButtonProps) {
  return (
    <button
      type="button"
      className="pm-match-filter-btn pm-match-filter-btn--top"
     
     
      aria-label="Filtrele"
      onClick={onClick}
    >
      <FiSliders />
      <span>Filtrele</span>
    </button>
  )
}
