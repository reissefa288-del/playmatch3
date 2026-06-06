type IconProps = { className?: string }

export function BubbleAimLeftIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="bb-chev-l" x1="28" y1="4" x2="4" y2="20">
          <stop offset="0%" stopColor="#b8f0ff" />
          <stop offset="50%" stopColor="#5ed4ff" />
          <stop offset="100%" stopColor="#2a9ee8" />
        </linearGradient>
        <filter id="bb-chev-l-glow">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        filter="url(#bb-chev-l-glow)"
        stroke="url(#bb-chev-l)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M26 4 14 12l12 8" />
        <path d="M20 4 8 12l12 8" opacity="0.82" />
        <path d="M14 4 2 12l12 8" opacity="0.64" />
      </g>
    </svg>
  )
}

export function BubbleAimRightIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="bb-chev-r" x1="4" y1="4" x2="28" y2="20">
          <stop offset="0%" stopColor="#b8f0ff" />
          <stop offset="50%" stopColor="#5ed4ff" />
          <stop offset="100%" stopColor="#2a9ee8" />
        </linearGradient>
        <filter id="bb-chev-r-glow">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        filter="url(#bb-chev-r-glow)"
        stroke="url(#bb-chev-r)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 4 18 12 6 20" />
        <path d="M12 4 24 12 12 20" opacity="0.82" />
        <path d="M18 4 30 12 18 20" opacity="0.64" />
      </g>
    </svg>
  )
}

export function BubbleSwapIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden>
      <defs>
        <linearGradient id="bb-swap" x1="6" y1="6" x2="22" y2="22">
          <stop offset="0%" stopColor="#ffd0ec" />
          <stop offset="55%" stopColor="#ff6eb8" />
          <stop offset="100%" stopColor="#e03090" />
        </linearGradient>
        <filter id="bb-swap-glow">
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        filter="url(#bb-swap-glow)"
        stroke="url(#bb-swap)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M9.5 8.5a7 7 0 0 1 10.8 2.2" />
        <path d="M17.8 8.2 20.3 10.7 17.8 13.2" />
        <path d="M18.5 19.5a7 7 0 0 1-10.8-2.2" />
        <path d="M10.2 19.8 7.7 17.3 10.2 14.8" />
      </g>
    </svg>
  )
}

export function BubbleFireIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id="bb-fire" x1="10" y1="4" x2="22" y2="28">
          <stop offset="0%" stopColor="#fff9c8" />
          <stop offset="40%" stopColor="#ffd54a" />
          <stop offset="100%" stopColor="#ff8c20" />
        </linearGradient>
        <filter id="bb-fire-glow">
          <feGaussianBlur stdDeviation="1.3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#bb-fire-glow)">
        <path
          d="M17 3 8 15h6.5l-1.2 10 10.5-14H17l1-8z"
          fill="url(#bb-fire)"
          stroke="rgba(255, 240, 200, 0.5)"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
        <path
          d="M15.5 9.5 12 14h3l-.6 4.5 4.2-6H15l.5-3z"
          fill="rgba(255, 255, 255, 0.55)"
        />
      </g>
    </svg>
  )
}
