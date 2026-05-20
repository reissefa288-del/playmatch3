import {
  fakePortraitForGender,
  type FakePortraitGender,
} from '../../shared/fakePortraits'

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
  distance: string
  location: string
  tags: MatchStyleTag[]
  favoriteGames: MatchGameChip[]
  bio: string
  photos: MatchPhoto[]
}

export const DAILY_LIKES_LIMIT = 15

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
    distance: '1.2 km uzaklıkta',
    location: 'İstanbul, Türkiye',
    tags: [
      { id: 'fps', label: 'FPS', icon: 'gamepad' },
      { id: 'ranked', label: 'Rekabetçi', icon: 'target' },
      { id: 'rank', label: 'Platinum I', icon: 'trophy' },
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
    distance: '3.2 km uzaklıkta',
    location: 'İstanbul, Türkiye',
    tags: [
      { id: 'strat', label: 'Strateji', icon: 'gamepad' },
      { id: 'rank', label: 'Diamond IV', icon: 'trophy' },
    ],
    favoriteGames: [
      { id: 'xox', label: 'XOX', emoji: '❌' },
      { id: 'puz', label: 'Puzzle', emoji: '🧩' },
      { id: '8top', label: '8 Top', emoji: '🎱' },
    ],
    bio: 'Strateji oyunlarında sabırlıyım; iyi bir duo arıyorum. Akşamları ranked açığım.',
  }),
  profile({
    id: 'damla',
    name: 'Damla',
    age: 20,
    gender: 'female',
    verified: true,
    online: true,
    compatibility: 84,
    distance: '4.1 km uzaklıkta',
    location: 'Kadıköy, İstanbul',
    tags: [
      { id: 'casual', label: 'Casual', icon: 'gamepad' },
      { id: 'rank', label: 'Gold II', icon: 'trophy' },
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
    distance: '2.4 km uzaklıkta',
    location: 'Beşiktaş, İstanbul',
    tags: [
      { id: 'multi', label: 'Multiplayer', icon: 'gamepad' },
      { id: 'rank', label: 'Diamond II', icon: 'trophy' },
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
    distance: '5.0 km uzaklıkta',
    location: 'Üsküdar, İstanbul',
    tags: [
      { id: 'ranked', label: 'Ranked', icon: 'target' },
      { id: 'rank', label: 'Platinum I', icon: 'trophy' },
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
    distance: '1.8 km uzaklıkta',
    location: 'Şişli, İstanbul',
    tags: [
      { id: 'fps', label: 'FPS', icon: 'gamepad' },
      { id: 'rank', label: 'Platinum III', icon: 'trophy' },
    ],
    favoriteGames: [
      { id: 'val', label: 'Valorant', emoji: '🎯' },
      { id: 'lol', label: 'LOL', emoji: '⚔️' },
      { id: 'ps', label: 'PlayStation', emoji: '🎮' },
    ],
    bio: 'Ranked arıyorum; iletişim güçlü, tilt az. Duo için uygun saatlerde online.',
  }),
  profile({
    id: 'azra',
    name: 'Azra',
    age: 19,
    gender: 'female',
    online: true,
    compatibility: 81,
    distance: '2.9 km uzaklıkta',
    location: 'Bakırköy, İstanbul',
    tags: [
      { id: 'casual', label: 'Casual', icon: 'gamepad' },
      { id: 'rank', label: 'Gold I', icon: 'trophy' },
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
    distance: '3.6 km uzaklıkta',
    location: 'Ataşehir, İstanbul',
    tags: [
      { id: 'duo', label: 'Duo', icon: 'target' },
      { id: 'rank', label: 'Diamond I', icon: 'trophy' },
    ],
    favoriteGames: [
      { id: 'bd', label: 'Block Duel', emoji: '🧱' },
      { id: '8top', label: '8 Top', emoji: '🎱' },
      { id: 'plus', label: '+1', emoji: '+1', more: true },
    ],
    bio: 'Duo partneri arıyorum; maç sonrası kısa sohbet, uzun vadede sabit takım.',
  }),
  profile({
    id: 'selin',
    name: 'Selin',
    age: 21,
    gender: 'female',
    verified: true,
    online: false,
    compatibility: 77,
    distance: '4.4 km uzaklıkta',
    location: 'Maltepe, İstanbul',
    tags: [
      { id: 'puz', label: 'Puzzle', icon: 'gamepad' },
      { id: 'rank', label: 'Platinum II', icon: 'trophy' },
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
    distance: '5.2 km uzaklıkta',
    location: 'Kartal, İstanbul',
    tags: [
      { id: 'comp', label: 'Rekabetçi', icon: 'target' },
      { id: 'rank', label: 'Master', icon: 'trophy' },
    ],
    favoriteGames: [
      { id: 'lol', label: 'LOL', emoji: '⚔️' },
      { id: 'val', label: 'Valorant', emoji: '🎯' },
    ],
    bio: 'Yüksek elo maçları; analitik oyun tarzı. Ciddi ama saygılı takım arkadaşı.',
  }),
]

/** @deprecated use matchDiscoverProfiles */
export const matchProfile = matchDiscoverProfiles[0]!

export const matchPeekCards = {
  left: { name: 'Ali' },
  right: { name: 'Damla' },
}
