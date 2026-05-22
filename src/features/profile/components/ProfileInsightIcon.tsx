export type ProfileInsightKind = 'likes' | 'visits'

type ProfileInsightIconProps = {
  kind: ProfileInsightKind
  variant: 'title' | 'decor'
}

function HeartDecorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="pm-insight-heart" x1="6" y1="4" x2="18" y2="20">
          <stop stopColor="#ffe8f8" />
          <stop offset="0.4" stopColor="#ff8ed4" />
          <stop offset="1" stopColor="#ff3a9a" />
        </linearGradient>
        <radialGradient id="pm-insight-heart-shine" cx="0.35" cy="0.28" r="0.5">
          <stop stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M12 20.2s-6.4-4.2-8.2-7.8C2.2 9.4 3.8 6.2 7 5.6c1.7-.3 3.2.4 5 2 1.6-1.8 3.1-2.4 5-2.1 3.2.5 4.9 3.7 3.4 6.8-1.7 3.6-8.4 7.7-8.4 7.7z"
        fill="url(#pm-insight-heart)"
      />
      <ellipse cx="9.1" cy="9.2" rx="2.2" ry="1.6" fill="url(#pm-insight-heart-shine)" />
    </svg>
  )
}

function EyeDecorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="pm-insight-eye" x1="4" y1="8" x2="20" y2="16">
          <stop stopColor="#e8f8ff" />
          <stop offset="0.5" stopColor="#7ed4ff" />
          <stop offset="1" stopColor="#4a9fff" />
        </linearGradient>
        <radialGradient id="pm-insight-pupil" cx="0.4" cy="0.35" r="0.6">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#2a6fd4" />
        </radialGradient>
      </defs>
      <path
        d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"
        stroke="url(#pm-insight-eye)"
        strokeWidth="2"
        fill="rgba(60, 160, 255, 0.12)"
      />
      <circle className="pm-profile-insight-eye__pupil" cx="12" cy="12" r="3.2" fill="url(#pm-insight-pupil)" />
      <circle cx="13.1" cy="11" r="1" fill="#fff" opacity="0.9" />
    </svg>
  )
}

function HeartTitleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 18.5s-4.5-3-6-5.5C4.5 10 5.5 7.5 8 7c1.2-.2 2.2.3 4 1.5 1.5-1.2 2.8-1.7 4-1.5 2.5.5 3.5 3 2.5 5.5-1.5 2.5-6 5.5-6 5.5z"
        fill="currentColor"
      />
    </svg>
  )
}

function EyeTitleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    </svg>
  )
}

export function ProfileInsightIcon({ kind, variant }: ProfileInsightIconProps) {
  if (variant === 'title') {
    return (
      <span className={`pm-profile-insight-title-icon pm-profile-insight-title-icon--${kind}`} aria-hidden>
        {kind === 'likes' ? <HeartTitleIcon /> : <EyeTitleIcon />}
      </span>
    )
  }

  return (
    <span className={`pm-profile-insight-decor pm-profile-insight-decor--${kind}`} aria-hidden>
      <span className="pm-profile-insight-decor__glow" />
      <span className="pm-profile-insight-decor__face">
        {kind === 'likes' ? <HeartDecorIcon /> : <EyeDecorIcon />}
      </span>
    </span>
  )
}
