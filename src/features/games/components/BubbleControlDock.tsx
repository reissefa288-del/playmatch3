import type { CSSProperties, PointerEvent } from 'react'

type BubbleControlDockProps = {
  live: boolean
  onAimLeft: () => void
  onAimRight: () => void
  onAimRelease: () => void
  onSwap: () => void
  onFire: () => void
}

function ChevronLeftIcon() {
  return (
    <svg className="pm-bubble-control-btn__icon" viewBox="0 0 32 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="bc-chev-l" x1="28" y1="4" x2="4" y2="20">
          <stop offset="0%" stopColor="#b8f0ff" />
          <stop offset="50%" stopColor="#5ed4ff" />
          <stop offset="100%" stopColor="#2a9ee8" />
        </linearGradient>
        <filter id="bc-chev-l-glow">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#bc-chev-l-glow)" stroke="url(#bc-chev-l)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M26 4 14 12l12 8" />
        <path d="M20 4 8 12l12 8" opacity="0.82" />
        <path d="M14 4 2 12l12 8" opacity="0.64" />
      </g>
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg className="pm-bubble-control-btn__icon" viewBox="0 0 32 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="bc-chev-r" x1="4" y1="4" x2="28" y2="20">
          <stop offset="0%" stopColor="#b8f0ff" />
          <stop offset="50%" stopColor="#5ed4ff" />
          <stop offset="100%" stopColor="#2a9ee8" />
        </linearGradient>
        <filter id="bc-chev-r-glow">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#bc-chev-r-glow)" stroke="url(#bc-chev-r)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4 18 12 6 20" />
        <path d="M12 4 24 12 12 20" opacity="0.82" />
        <path d="M18 4 30 12 18 20" opacity="0.64" />
      </g>
    </svg>
  )
}

function SwapIcon() {
  return (
    <svg className="pm-bubble-control-btn__icon" viewBox="0 0 28 28" fill="none" aria-hidden>
      <defs>
        <linearGradient id="bc-swap" x1="6" y1="6" x2="22" y2="22">
          <stop offset="0%" stopColor="#ffd0ec" />
          <stop offset="55%" stopColor="#ff6eb8" />
          <stop offset="100%" stopColor="#e03090" />
        </linearGradient>
        <filter id="bc-swap-glow">
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#bc-swap-glow)" stroke="url(#bc-swap)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M9.5 8.5a7 7 0 0 1 10.8 2.2" />
        <path d="M17.8 8.2 20.3 10.7 17.8 13.2" />
        <path d="M18.5 19.5a7 7 0 0 1-10.8-2.2" />
        <path d="M10.2 19.8 7.7 17.3 10.2 14.8" />
      </g>
    </svg>
  )
}

function GearFireIcon() {
  return (
    <svg className="pm-bubble-control-btn__icon is-gear" viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id="bc-gear" x1="8" y1="6" x2="24" y2="26">
          <stop offset="0%" stopColor="#fff6d0" />
          <stop offset="45%" stopColor="#ffd54a" />
          <stop offset="100%" stopColor="#e09020" />
        </linearGradient>
        <filter id="bc-gear-glow">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#bc-gear-glow)" fill="url(#bc-gear)" stroke="rgba(255, 240, 180, 0.45)" strokeWidth="0.6">
        <path d="M16 4.2 18.1 8.6h3.9l2.4-3.4 2.8 1.6-1.4 4 3.2 1.8v4.4l-3.2 1.8 1.4 4-2.8 1.6-2.4-3.4h-3.9L16 27.8l-2.1-4.4H10l-2.4 3.4-2.8-1.6 1.4-4-3.2-1.8v-4.4l3.2-1.8-1.4-4 2.8-1.6 2.4 3.4h3.9L16 4.2Z" />
        <circle cx="16" cy="16" r="5.2" fill="rgba(12, 10, 6, 0.55)" stroke="rgba(255, 220, 120, 0.5)" />
        <path
          d="M16 12.2v7.6M12.2 16h7.6M13.4 13.4l5.2 5.2M18.6 13.4l-5.2 5.2"
          stroke="#fff8e0"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  )
}

function preventDefault(e: PointerEvent<HTMLButtonElement>) {
  e.preventDefault()
}

export function BubbleControlDock({
  live,
  onAimLeft,
  onAimRight,
  onAimRelease,
  onSwap,
  onFire,
}: BubbleControlDockProps) {
  const disabled = !live

  return (
    <div
      className={`pm-bubble-control-bar${live ? ' is-live' : ''}`}
      style={{ '--bc-panel-ar': '1380 / 752' } as CSSProperties}
    >
      <div className="pm-bubble-control-bar__rim" aria-hidden />
      <div className="pm-bubble-control-bar__circuit" aria-hidden />
      <div className="pm-bubble-control-bar__grid" role="group" aria-label="Oyun kontrolleri">
        <button
          type="button"
          className="pm-bubble-control-btn is-aim-left"
          aria-label="Sola nişan"
          disabled={disabled}
          onPointerDown={onAimLeft}
          onPointerUp={onAimRelease}
          onPointerLeave={onAimRelease}
          onPointerCancel={onAimRelease}
        >
          <span className="pm-bubble-control-btn__bezel" aria-hidden />
          <span className="pm-bubble-control-btn__face">
            <ChevronLeftIcon />
          </span>
        </button>

        <button
          type="button"
          className="pm-bubble-control-btn is-swap"
          aria-label="Balon değiştir"
          disabled={disabled}
          onPointerDown={(e) => {
            preventDefault(e)
            onSwap()
          }}
        >
          <span className="pm-bubble-control-btn__bezel" aria-hidden />
          <span className="pm-bubble-control-btn__face">
            <SwapIcon />
          </span>
        </button>

        <button
          type="button"
          className="pm-bubble-control-btn is-fire"
          aria-label="Ateş"
          disabled={disabled}
          onPointerDown={(e) => {
            preventDefault(e)
            onFire()
          }}
        >
          <span className="pm-bubble-control-btn__bezel" aria-hidden />
          <span className="pm-bubble-control-btn__face">
            <GearFireIcon />
          </span>
        </button>

        <button
          type="button"
          className="pm-bubble-control-btn is-aim-right"
          aria-label="Sağa nişan"
          disabled={disabled}
          onPointerDown={onAimRight}
          onPointerUp={onAimRelease}
          onPointerLeave={onAimRelease}
          onPointerCancel={onAimRelease}
        >
          <span className="pm-bubble-control-btn__bezel" aria-hidden />
          <span className="pm-bubble-control-btn__face">
            <ChevronRightIcon />
          </span>
        </button>
      </div>
    </div>
  )
}
