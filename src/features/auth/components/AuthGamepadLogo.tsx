export function AuthGamepadLogo() {
  return (
    <svg
      className="pm-auth-logo__icon"
      viewBox="0 0 64 40"
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pm-auth-pad-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5ce4ff" />
          <stop offset="100%" stopColor="#2a8cff" />
        </linearGradient>
        <linearGradient id="pm-auth-pad-pink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff7fd8" />
          <stop offset="100%" stopColor="#ff3cb0" />
        </linearGradient>
        <filter id="pm-auth-pad-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#pm-auth-pad-glow)">
        <path
          d="M8 14c0-6.6 5.4-12 12-12h12c6.6 0 12 5.4 12 12v12c0 6.6-5.4 12-12 12H20c-6.6 0-12-5.4-12-12V14z"
          fill="url(#pm-auth-pad-blue)"
          opacity="0.95"
        />
        <path
          d="M32 2h12c6.6 0 12 5.4 12 12v12c0 6.6-5.4 12-12 12H32V2z"
          fill="url(#pm-auth-pad-pink)"
          opacity="0.95"
        />
        <rect x="14" y="18" width="5" height="5" rx="1.2" fill="#081018" opacity="0.55" />
        <rect x="22" y="18" width="5" height="5" rx="1.2" fill="#081018" opacity="0.55" />
        <circle cx="44" cy="18" r="3" fill="#081018" opacity="0.5" />
        <circle cx="52" cy="22" r="3" fill="#081018" opacity="0.5" />
      </g>
    </svg>
  )
}
