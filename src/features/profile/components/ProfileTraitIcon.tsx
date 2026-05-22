export type ProfileTraitIconKind = 'role' | 'style' | 'time' | 'duo'

type ProfileTraitIconProps = {
  kind: ProfileTraitIconKind
}

function RoleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="pm-trait-role" x1="4" y1="6" x2="20" y2="18">
          <stop stopColor="#b8f0ff" />
          <stop offset="1" stopColor="#5a9fff" />
        </linearGradient>
      </defs>
      <path
        d="M8 11h8v2.5a2.5 2.5 0 0 1-2.5 2.5H10.5A2.5 2.5 0 0 1 8 13.5V11z"
        fill="url(#pm-trait-role)"
      />
      <path
        d="M7 10.5h10a1.5 1.5 0 0 0 1.5-1.5V9a3 3 0 0 0-3-3h-7a3 3 0 0 0-3 3v.5a1.5 1.5 0 0 0 1.5 1.5z"
        fill="url(#pm-trait-role)"
      />
      <circle cx="9.5" cy="13.2" r="1" fill="#fff" opacity="0.85" />
      <circle cx="14.5" cy="13.2" r="1" fill="#fff" opacity="0.85" />
      <path d="M10 7.5h1.8M12.2 7.5h1.8" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

function StyleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="pm-trait-style" x1="5" y1="4" x2="19" y2="20">
          <stop stopColor="#ffe0a8" />
          <stop offset="0.5" stopColor="#ff7a4a" />
          <stop offset="1" stopColor="#ff3a6a" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="7.5" stroke="url(#pm-trait-style)" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" fill="url(#pm-trait-style)" />
      <path d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2" stroke="url(#pm-trait-style)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function TimeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="pm-trait-time" x1="6" y1="5" x2="18" y2="19">
          <stop stopColor="#e8d4ff" />
          <stop offset="0.5" stopColor="#a88bff" />
          <stop offset="1" stopColor="#6b5cff" />
        </linearGradient>
      </defs>
      <path
        d="M18 14.5a7.5 7.5 0 1 1-9.8-9.2 7.5 7.5 0 0 1 9.8 9.2z"
        fill="url(#pm-trait-time)"
        opacity="0.95"
      />
      <circle cx="14" cy="8" r="1.2" fill="#fff" opacity="0.9" />
      <circle cx="16.5" cy="10.5" r="0.8" fill="#fff" opacity="0.6" />
    </svg>
  )
}

function DuoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="pm-trait-duo-a" x1="3" y1="6" x2="14" y2="20">
          <stop stopColor="#b8f8ff" />
          <stop offset="1" stopColor="#5eb8ff" />
        </linearGradient>
        <linearGradient id="pm-trait-duo-b" x1="12" y1="6" x2="21" y2="20">
          <stop stopColor="#ffd0f5" />
          <stop offset="1" stopColor="#ff6ec8" />
        </linearGradient>
      </defs>
      <circle cx="8.5" cy="9" r="3" fill="url(#pm-trait-duo-a)" />
      <path
        d="M4 18.5c.5-2.8 2.4-4.2 4.5-4.2s4 1.4 4.5 4.2"
        stroke="url(#pm-trait-duo-a)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="15.5" cy="9" r="3" fill="url(#pm-trait-duo-b)" />
      <path
        d="M11 18.5c.5-2.8 2.4-4.2 4.5-4.2s4 1.4 4.5 4.2"
        stroke="url(#pm-trait-duo-b)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

const icons: Record<ProfileTraitIconKind, () => React.ReactElement> = {
  role: RoleIcon,
  style: StyleIcon,
  time: TimeIcon,
  duo: DuoIcon,
}

export function ProfileTraitIcon({ kind }: ProfileTraitIconProps) {
  const Icon = icons[kind]

  return (
    <span className={`pm-profile-trait-icon pm-profile-trait-icon--${kind}`} aria-hidden>
      <span className="pm-profile-trait-icon__glow" />
      <span className="pm-profile-trait-icon__face">
        <Icon />
      </span>
    </span>
  )
}
