export type ProfileStatIconKind = 'friends' | 'likes' | 'visits' | 'matches'

type ProfileStatStripIconProps = {
  kind: ProfileStatIconKind
}

function FriendsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="pm-stat-friends-a" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c8e8ff" />
          <stop offset="0.55" stopColor="#7eb8ff" />
          <stop offset="1" stopColor="#5a7dff" />
        </linearGradient>
        <linearGradient id="pm-stat-friends-b" x1="8" y1="6" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f0f6ff" />
          <stop offset="1" stopColor="#9ec4ff" />
        </linearGradient>
      </defs>
      <circle cx="8.5" cy="8" r="3.2" fill="url(#pm-stat-friends-a)" />
      <path
        d="M3.5 19.5c.6-3.2 2.8-4.8 5-4.8s4.4 1.6 5 4.8"
        stroke="url(#pm-stat-friends-a)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="9" r="2.8" fill="url(#pm-stat-friends-b)" opacity="0.95" />
      <path
        d="M12.5 19.5c.5-2.6 2.2-3.9 4-3.9 1.5 0 2.8.9 3.5 3.9"
        stroke="url(#pm-stat-friends-b)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LikesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="pm-stat-likes" x1="6" y1="4" x2="18" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffe8f8" />
          <stop offset="0.35" stopColor="#ff8ed4" />
          <stop offset="1" stopColor="#ff3a9a" />
        </linearGradient>
        <radialGradient id="pm-stat-likes-shine" cx="0.35" cy="0.3" r="0.55">
          <stop stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M12 20.5s-6.8-4.4-8.6-8.2C1.8 9.2 3.6 5.8 7 5.2c1.8-.3 3.4.4 5 2.2 1.6-1.8 3.2-2.5 5-2.2 3.4.6 5.2 4 3.6 7.1-1.8 3.8-8.6 8.2-8.6 8.2z"
        fill="url(#pm-stat-likes)"
      />
      <ellipse cx="9.2" cy="9.5" rx="2.4" ry="1.8" fill="url(#pm-stat-likes-shine)" />
    </svg>
  )
}

function VisitsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="pm-stat-visits" x1="5" y1="3" x2="19" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff9e8" />
          <stop offset="0.4" stopColor="#ffe566" />
          <stop offset="1" stopColor="#ff9f3a" />
        </linearGradient>
        <linearGradient id="pm-stat-visits-core" x1="12" y1="6" x2="12" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M12 3.5l2.35 5.42 5.9.5-4.42 3.9 1.32 5.78L12 16.2l-5.15 2.9 1.32-5.78-4.42-3.9 5.9-.5L12 3.5z"
        fill="url(#pm-stat-visits)"
      />
      <path
        d="M12 7.5l1.2 2.9 3.1.28-2.35 2.05.7 3.02L12 14.4l-2.65 1.34.7-3.02-2.35-2.05 3.1-.28L12 7.5z"
        fill="url(#pm-stat-visits-core)"
        opacity="0.55"
      />
    </svg>
  )
}

function MatchesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="pm-stat-matches" x1="4" y1="5" x2="20" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f2e8ff" />
          <stop offset="0.45" stopColor="#c49bff" />
          <stop offset="1" stopColor="#7b5cff" />
        </linearGradient>
        <linearGradient id="pm-stat-matches-dot" x1="14" y1="8" x2="18" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffb8e8" />
          <stop offset="1" stopColor="#ff5eb8" />
        </linearGradient>
      </defs>
      <path
        d="M5 6.5h11.5a2.5 2.5 0 0 1 2.5 2.5v6.8a2.5 2.5 0 0 1-2.5 2.5H9.2L5 19.8V6.5z"
        fill="url(#pm-stat-matches)"
      />
      <path
        d="M8 10.2h7.8M8 13.4h5.2"
        stroke="#fff"
        strokeOpacity="0.85"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="17.2" cy="8.8" r="2.2" fill="url(#pm-stat-matches-dot)" />
      <circle cx="17.2" cy="8.8" r="0.9" fill="#fff" opacity="0.7" />
    </svg>
  )
}

const icons: Record<ProfileStatIconKind, () => React.ReactElement> = {
  friends: FriendsIcon,
  likes: LikesIcon,
  visits: VisitsIcon,
  matches: MatchesIcon,
}

export function ProfileStatStripIcon({ kind }: ProfileStatStripIconProps) {
  const Icon = icons[kind]

  return (
    <span className={`pm-profile-stat-icon pm-profile-stat-icon--${kind}`} aria-hidden>
      <span className="pm-profile-stat-icon__glow" />
      <span className="pm-profile-stat-icon__ring" />
      <span className="pm-profile-stat-icon__orb" />
      <span className="pm-profile-stat-icon__face">
        <Icon />
      </span>
    </span>
  )
}
