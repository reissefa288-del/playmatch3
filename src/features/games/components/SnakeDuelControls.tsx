import { FiChevronDown, FiChevronLeft, FiChevronRight, FiChevronUp } from 'react-icons/fi'
import type { Direction } from '../utils/snakeDuelEngine'

type Props = {
  disabled?: boolean
  onDirection: (dir: Direction) => void
}

export function SnakeDuelControls({ disabled = false, onDirection }: Props) {
  return (
    <div className={`pm-snake-controls ${disabled ? 'is-disabled' : ''}`} aria-label="Yön kontrolleri">
      <button type="button" className="is-up" disabled={disabled} onClick={() => onDirection('up')} aria-label="Yukarı">
        <FiChevronUp />
      </button>
      <button type="button" className="is-left" disabled={disabled} onClick={() => onDirection('left')} aria-label="Sol">
        <FiChevronLeft />
      </button>
      <button
        type="button"
        className="is-right"
        disabled={disabled}
        onClick={() => onDirection('right')}
        aria-label="Sağ"
      >
        <FiChevronRight />
      </button>
      <button type="button" className="is-down" disabled={disabled} onClick={() => onDirection('down')} aria-label="Aşağı">
        <FiChevronDown />
      </button>
    </div>
  )
}
