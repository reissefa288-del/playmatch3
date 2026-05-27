type IconProps = {
  className?: string
  size?: number
}

type ControlIconDefsProps = {
  id: string
  highlight?: string
  mid?: string
  shadow?: string
}

function ControlIconDefs({
  id,
  highlight = '#ffffff',
  mid = '#e8f4ff',
  shadow = '#8ed4ff',
}: ControlIconDefsProps) {
  return (
    <defs>
      <linearGradient id={`${id}-face`} x1="5" y1="4" x2="19" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor={highlight} />
        <stop offset="48%" stopColor={mid} />
        <stop offset="100%" stopColor={shadow} />
      </linearGradient>
      <linearGradient id={`${id}-shine`} x1="12" y1="3" x2="12" y2="14" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="1.15" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  )
}

export function BubbleTrophyIcon({ className, size = 14 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="bubble-trophy-g" x1="4" y1="4" x2="20" y2="20">
          <stop offset="0%" stopColor="#f5e6a8" />
          <stop offset="45%" stopColor="#d4a843" />
          <stop offset="100%" stopColor="#9a7030" />
        </linearGradient>
      </defs>
      <path
        d="M7 4h10v2.2c0 2.1-1.2 3.9-3 4.8V14h2.5a1.5 1.5 0 0 1 0 3H7.5a1.5 1.5 0 0 1 0-3H10v-3c-1.8-.9-3-2.7-3-4.8V4Z"
        fill="url(#bubble-trophy-g)"
        stroke="rgba(255,230,160,0.55)"
        strokeWidth="0.8"
      />
      <path d="M5 5H3.8a1.8 1.8 0 0 0 0 3.6H5M19 5h1.2a1.8 1.8 0 0 1 0 3.6H19" stroke="url(#bubble-trophy-g)" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="9" y="17" width="6" height="2.2" rx="1" fill="rgba(180,140,60,0.85)" />
    </svg>
  )
}

export function BubbleHeartIcon({ className, size = 11, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="bubble-heart-g" x1="4" y1="4" x2="20" y2="20">
          <stop offset="0%" stopColor="#ff6b9d" />
          <stop offset="100%" stopColor="#c8326a" />
        </linearGradient>
      </defs>
      <path
        d="M12 20.5s-7.2-4.6-7.2-9.4c0-2.6 2.1-4.2 4.4-4.2 1.4 0 2.7.7 3.5 1.8.8-1.1 2.1-1.8 3.5-1.8 2.3 0 4.4 1.6 4.4 4.2 0 4.8-7.2 9.4-7.2 9.4Z"
        fill={filled ? 'url(#bubble-heart-g)' : 'rgba(255,80,130,0.08)'}
        stroke={filled ? 'rgba(255,160,190,0.45)' : 'rgba(255,100,140,0.35)'}
        strokeWidth="1.2"
      />
    </svg>
  )
}

export function BubbleAimLeftIcon({ className, size = 22 }: IconProps) {
  const id = 'bubble-aim-l'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ControlIconDefs id={id} />
      <g filter={`url(#${id}-glow)`}>
        <path
          d="M15.5 6.5 8.5 12l7 6.5-2-6.8-5-5.7 5-5.7-2-6.8Z"
          fill={`url(#${id}-face)`}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
        <path d="M17.5 12H10.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
        <circle cx="8.8" cy="12" r="1.25" fill="#ffffff" />
      </g>
    </svg>
  )
}

export function BubbleAimRightIcon({ className, size = 22 }: IconProps) {
  const id = 'bubble-aim-r'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ControlIconDefs id={id} />
      <g filter={`url(#${id}-glow)`}>
        <path
          d="M8.5 6.5 15.5 12l-7 6.5 2-6.8 5-5.7-5-5.7 2-6.8Z"
          fill={`url(#${id}-face)`}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
        <path d="M6.5 12h7" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
        <circle cx="15.2" cy="12" r="1.25" fill="#ffffff" />
      </g>
    </svg>
  )
}

export function BubbleSwapIcon({ className, size = 22 }: IconProps) {
  const id = 'bubble-swap'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ControlIconDefs
        id={id}
        highlight="#ffffff"
        mid="#ffe8f2"
        shadow="#ff9ec4"
      />
      <g filter={`url(#${id}-glow)`}>
        <circle cx="8.2" cy="16.2" r="3.1" fill={`url(#${id}-face)`} stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" />
        <circle cx="15.8" cy="7.8" r="3.1" fill={`url(#${id}-face)`} stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" />
        <path
          d="M10.8 14.2c2.2-1.1 3.6-2.4 4.6-4.2"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M16.2 7.4H9.2l1.6-1.6M7.8 16.6h7l-1.6 1.6"
          stroke={`url(#${id}-face)`}
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.2 9.6l2.2-2M10.8 14.4l-2.2 2"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

export function BubbleFireIcon({ className, size = 24 }: IconProps) {
  const id = 'bubble-fire'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ControlIconDefs
        id={id}
        highlight="#fffef0"
        mid="#fff0b8"
        shadow="#ffd54a"
      />
      <g filter={`url(#${id}-glow)`}>
        <circle cx="12" cy="12" r="7.8" stroke={`url(#${id}-face)`} strokeWidth="1.4" opacity="0.45" />
        <circle cx="12" cy="12" r="5.2" stroke="#ffffff" strokeWidth="1.2" opacity="0.7" />
        <circle cx="12" cy="12" r="2.1" fill={`url(#${id}-face)`} />
        <circle cx="12" cy="12" r="1" fill="#ffffff" />
        <path d="M12 4.2v2.4M12 17.4v2.4M4.2 12h2.4M17.4 12h2.4" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M7.2 7.2l1.5 1.5M15.3 15.3l1.5 1.5M16.8 7.2l-1.5 1.5M7.8 15.3l-1.5 1.5"
          stroke="#ffffff"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M8.2 5.2h2.2v2.2M13.6 5.2h2.2v2.2M8.2 16.6h2.2v2.2M13.6 16.6h2.2v2.2"
          stroke={`url(#${id}-face)`}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

export function BubbleBackIcon({ className, size = 20 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M15 6 9 12l6 6"
        stroke="currentColor"
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
