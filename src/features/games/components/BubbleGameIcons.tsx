type IconProps = {
  className?: string
  size?: number
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
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 6 8 12l6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 12H8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
    </svg>
  )
}

export function BubbleAimRightIcon({ className, size = 22 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
    </svg>
  )
}

export function BubbleSwapIcon({ className, size = 22 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 7H8l2.5-2.5M8 17h8l-2.5 2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 7v10M16 7v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.25" />
    </svg>
  )
}

export function BubbleFireIcon({ className, size = 24 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.4" opacity="0.35" />
      <circle cx="12" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

export function BubbleBackIcon({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 6 8 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
