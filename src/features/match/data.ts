import {
  fakePortraitForGender,
  type FakePortraitGender,
} from '../../shared/fakePortraits'
import { DAILY_LIKES_LIMIT } from '../../shared/dailyLikes'

export { DAILY_LIKES_LIMIT }

export type MatchTabId = 'discover' | 'likers' | 'matches'

export type MatchGameChip = {
  id: string
  label: string
  emoji: string
  more?: boolean
}

export type MatchStyleTag = {
  id: string
  label: string
  icon: 'gamepad' | 'target' | 'trophy'
}

export type MatchPhoto = {
  id: string
  objectPosition: string
}

export type MatchProfile = {
  id: string
  name: string
  age: number
  gender: FakePortraitGender
  portraitSrc: string
  verified?: boolean
  online: boolean
  compatibility: number
  province: string
  distance: string
  location: string
  tags: MatchStyleTag[]
  favoriteGames: MatchGameChip[]
  bio: string
  photos: MatchPhoto[]
}

export const matchTabs: { id: MatchTabId; label: string; badge?: number }[] = [
  { id: 'discover', label: 'Keşfet' },
  { id: 'likers', label: 'Beğenenler' },
  { id: 'matches', label: 'Eşleşmelerim', badge: 12 },
]

function photos(id: string): MatchPhoto[] {
  return [
    { id: `${id}-1`, objectPosition: '50% 10%' },
    { id: `${id}-2`, objectPosition: '50% 38%' },
    { id: `${id}-3`, objectPosition: '50% 68%' },
  ]
}

type ProfileSeed = Omit<MatchProfile, 'photos' | 'portraitSrc'> & { gender: FakePortraitGender }

function profile(seed: ProfileSeed): MatchProfile {
  return {
    ...seed,
    portraitSrc: fakePortraitForGender(seed.gender),
    photos: photos(seed.id),
  }
}

export const matchDiscoverProfiles: MatchProfile[] = [
  profile({
    id: 'zeynep',
    name: 'Zeynep',
    age: 21,
    gender: 'female',
    verified: true,
    online: true,
    compatibility: 92,
    province: 'İstanbul',
    distance: '1.2 km · aynı il',
    location: 'Kadıköy, İstanbul',
    tags: [
      { id: 'fps', label: 'FPS', icon: 'gamepad' },
      { id: 'ranked', label: 'Rekabetçi', icon: 'target' },
      { id: 'rank', label: 'Seviye', icon: 'trophy' },
    ],
    favoriteGames: [
      { id: 'bd', label: 'Block Duel', emoji: '🧱' },
      { id: 'val', label: 'Valorant', emoji: '🎯' },
      { id: 'lol', label: 'LOL', emoji: '⚔️' },
      { id: 'plus', label: '+2', emoji: '+2', more: true },
    ],
    bio: 'Rekabeti severim, kazanmak için oynarım. Yeni insanlarla tanışıp takım olmak isterim! 🎮💜',
  }),
  profile({
    id: 'mert',
    name: 'Mert',
    age: 24,
    gender: 'male',
    online: true,
    compatibility: 87,
    province: 'Ankara',
    distance: 'Ankara · 352 km',
    location: 'Çankaya, Ankara',
    tags: [
      { id: 'strat', label: 'Strateji', icon: 'gamepad' },
      { id: 'rank', label: 'Seviye', icon: 'trophy' },
    ],
    favoriteGames: [
      { id: 'xox', label: 'XOX', emoji: '❌' },
      { id: 'puz', label: 'Puzzle', emoji: '🧩' },
      { id: '8top', label: '8 Top', emoji: '🎱' },
    ],
    bio: 'Strateji oyunlarında sabırlıyım; akşamları online olurum.',
  }),
  profile({
    id: 'damla',
    name: 'Damla',
    age: 20,
    gender: 'female',
    verified: true,
    online: true,
    compatibility: 84,
    province: 'İzmir',
    distance: 'İzmir · 478 km',
    location: 'Bornova, İzmir',
    tags: [
      { id: 'casual', label: 'Casual', icon: 'gamepad' },
      { id: 'rank', label: 'Seviye', icon: 'trophy' },
    ],
    favoriteGames: [
      { id: 'block', label: 'Block', emoji: '🧱' },
      { id: 'xox', label: 'XOX', emoji: '❌' },
      { id: 'puz', label: 'Puzzle', emoji: '🧩' },
    ],
    bio: 'Eğlence önceliğim; toxic olmayan lobilerde takılırım. Birlikte puzzle çözelim mi?',
  }),
  profile({
    id: 'ali',
    name: 'Ali',
    age: 23,
    gender: 'male',
    online: true,
    compatibility: 79,
    province: 'İstanbul',
    distance: '4.8 km · aynı il',
    location: 'Beşiktaş, İstanbul',
    tags: [
      { id: 'multi', label: 'Multiplayer', icon: 'gamepad' },
      { id: 'rank', label: 'Seviye', icon: 'trophy' },
    ],
    favoriteGames: [
      { id: '8top', label: '8 Top', emoji: '🎱' },
      { id: 'block', label: 'Block Duel', emoji: '🧱' },
    ],
    bio: '8 Top ve Block Duel ana oyunlarım. Hızlı maç, net iletişim — hazırım.',
  }),
  profile({
    id: 'emir',
    name: 'Emir',
    age: 25,
    gender: 'male',
    online: true,
    compatibility: 76,
    province: 'Bursa',
    distance: 'Bursa · 155 km',
    location: 'Nilüfer, Bursa',
    tags: [
      { id: 'ranked', label: 'Ranked', icon: 'target' },
      { id: 'rank', label: 'Seviye', icon: 'trophy' },
    ],
    favoriteGames: [
      { id: 'puz', label: 'Puzzle', emoji: '🧩' },
      { id: 'duel', label: 'Duel', emoji: '⚔️' },
    ],
    bio: 'Puzzle Rush tutkunu. Yeni modları dener, skor tablosunda yükselmeyi severim.',
  }),
  profile({
    id: 'ece',
    name: 'Ece',
    age: 22,
    gender: 'female',
    verified: true,
    online: true,
    compatibility: 88,
    province: 'Antalya',
    distance: 'Antalya · 482 km',
    location: 'Muratpaşa, Antalya',
    tags: [
      { id: 'fps', label: 'FPS', icon: 'gamepad' },
      { id: 'rank', label: 'Seviye', icon: 'trophy' },
    ],
    favoriteGames: [
      { id: 'val', label: 'Valorant', emoji: '🎯' },
      { id: 'lol', label: 'LOL', emoji: '⚔️' },
      { id: 'ps', label: 'PlayStation', emoji: '🎮' },
    ],
    bio: 'İletişim güçlü, sakin oyun tarzı; akşamları online.',
  }),
  profile({
    id: 'azra',
    name: 'Azra',
    age: 19,
    gender: 'female',
    online: true,
    compatibility: 81,
    province: 'İstanbul',
    distance: '2.9 km · aynı il',
    location: 'Bakırköy, İstanbul',
    tags: [
      { id: 'casual', label: 'Casual', icon: 'gamepad' },
      { id: 'rank', label: 'Seviye', icon: 'trophy' },
    ],
    favoriteGames: [
      { id: 'block', label: 'Block', emoji: '🧱' },
      { id: 'xox', label: 'XOX', emoji: '❌' },
    ],
    bio: 'Yeni başladım ama öğrenmeye açığım. Sakin ve eğlenceli maçlar arıyorum.',
  }),
  profile({
    id: 'can',
    name: 'Can',
    age: 26,
    gender: 'male',
    online: true,
    compatibility: 83,
    province: 'Adana',
    distance: 'Adana · 868 km',
    location: 'Seyhan, Adana',
    tags: [
      { id: 'comp', label: 'Rekabetçi', icon: 'target' },
      { id: 'rank', label: 'Seviye', icon: 'trophy' },
    ],
    favoriteGames: [
      { id: 'bd', label: 'Block Duel', emoji: '🧱' },
      { id: '8top', label: '8 Top', emoji: '🎱' },
      { id: 'plus', label: '+1', emoji: '+1', more: true },
    ],
    bio: 'Block Duel ve 8 Top severim; maç sonrası kısa sohbet.',
  }),
  profile({
    id: 'selin',
    name: 'Selin',
    age: 21,
    gender: 'female',
    verified: true,
    online: false,
    compatibility: 77,
    province: 'Kocaeli',
    distance: 'Kocaeli · 98 km',
    location: 'İzmit, Kocaeli',
    tags: [
      { id: 'puz', label: 'Puzzle', icon: 'gamepad' },
      { id: 'rank', label: 'Seviye', icon: 'trophy' },
    ],
    favoriteGames: [
      { id: 'puz', label: 'Puzzle', emoji: '🧩' },
      { id: 'block', label: 'Block', emoji: '🧱' },
    ],
    bio: 'Akşamları puzzle ve block; hafta sonu daha uzun oturumlar. Mesaj atın.',
  }),
  profile({
    id: 'berk',
    name: 'Berk',
    age: 24,
    gender: 'male',
    online: true,
    compatibility: 90,
    province: 'Ankara',
    distance: 'Ankara · 352 km',
    location: 'Yenimahalle, Ankara',
    tags: [
      { id: 'comp', label: 'Rekabetçi', icon: 'target' },
      { id: 'rank', label: 'Seviye', icon: 'trophy' },
    ],
    favoriteGames: [
      { id: 'lol', label: 'LOL', emoji: '⚔️' },
      { id: 'val', label: 'Valorant', emoji: '🎯' },
    ],
    bio: 'Yüksek elo maçları; analitik oyun tarzı. Ciddi ama saygılı takım arkadaşı.',
  }),
]

/** Eşleşme sonrası oyun daveti gönderilebilecek profiller */
const MATCHED_PROFILE_IDS = ['zeynep', 'mert', 'ali', 'damla', 'ece', 'azra', 'berk'] as const

export const matchedProfiles: MatchProfile[] = MATCHED_PROFILE_IDS.map((id) =>
  matchDiscoverProfiles.find((profile) => profile.id === id),
).filter((profile): profile is MatchProfile => Boolean(profile))

/** @deprecated use matchDiscoverProfiles */
export const matchProfile = matchDiscoverProfiles[0]!

export const matchPeekCards = {
  left: { name: 'Ali' },
  right: { name: 'Damla' },
}
