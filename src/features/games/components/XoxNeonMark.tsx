type XoxNeonMarkProps = {
  symbol: 'X' | 'O'
  className?: string
}

export function XoxNeonMark({ symbol, className = '' }: XoxNeonMarkProps) {
  if (symbol === 'X') {
    return (
      <svg
        className={`pm-xox-mark pm-xox-mark--x ${className}`}
        viewBox="0 0 64 64"
        aria-hidden
       
       
       
      >
        <defs>
          <filter id="pm-xox-x-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line
          x1="14"
          y1="14"
          x2="50"
          y2="50"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#pm-xox-x-glow)"
         
         
         
        />
        <line
          x1="50"
          y1="14"
          x2="14"
          y2="50"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#pm-xox-x-glow)"
         
         
         
        />
      </svg>
    )
  }

  return (
    <svg
      className={`pm-xox-mark pm-xox-mark--o ${className}`}
      viewBox="0 0 64 64"
      aria-hidden
     
     
     
    >
      <defs>
        <filter id="pm-xox-o-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        filter="url(#pm-xox-o-glow)"
       
       
       
      />
    </svg>
  )
}
