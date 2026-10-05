import type { MatchProfile } from '../match/data'
import { fetchDiscoverProfiles } from '../match/firestoreMatch'
import { isFirebaseConfigured } from '../auth/firebaseApp'
import { fakePortraitForGender } from '../../shared/fakePortraits'
import { readCachedUserProfile } from '../profile/userProfileStore'
import type { FakePortraitGender } from '../../shared/fakePortraits'

export type QuickMatchGame = {
  id: string
  title: string
  route: string
  emoji: string
}

export type QuickMatchResult = {
  opponent: MatchProfile
  game: QuickMatchGame
}

const QUICK_MATCH_GAMES: QuickMatchGame[] = [
  { id: 'xox', title: 'XOX', route: '/games/xox', emoji: '❌' },
  { id: 'bubble-shooter', title: 'Bubble Shooter', route: '/games/bubble-shooter', emoji: '🫧' },
  { id: 'block-duel', title: 'Cube Duel', route: '/games/block-duel', emoji: '🧱' },
  { id: 'brick-break', title: 'Brick Break', route: '/games/brick-break', emoji: '🔨' },
  { id: 'memory-duel', title: 'Memory Duel', route: '/games/memory-duel', emoji: '🧠' },
  { id: 'stack-duel', title: 'Stack Duel', route: '/games/stack-duel', emoji: '📚' },
  { id: 'math-duel', title: 'Math Duel', route: '/games/math-duel', emoji: '🔢' },
  { id: 'pong-duel', title: 'Pong Duel', route: '/games/pong-duel/play', emoji: '🏓' },
  { id: 'snake-duel', title: 'Snake Duel', route: '/games/snake-duel/play', emoji: '🐍' },
  { id: 'color-match', title: 'Color Match', route: '/games/color-match/play', emoji: '🎨' },
  { id: 'neon-crush', title: 'Neon Crush', route: '/games/neon-crush/play', emoji: '✨' },
  { id: 'simon-duel', title: 'Simon Duel', route: '/games/simon-duel/play', emoji: '🎯' },
  { id: 'slice-duel', title: 'Slice Duel', route: '/games/slice-duel/play', emoji: '⚔️' },
  { id: 'chess-duel', title: 'Satranç Duel', route: '/games/chess-duel/play', emoji: '♟️' },
  { id: 'space-duel', title: 'Space Duel', route: '/games/space-duel/play', emoji: '🚀' },
  { id: 'missile-command-duel', title: 'Rift Ward', route: '/games/missile-command-duel/play', emoji: '🛡️' },
  { id: 'defender-duel', title: 'Defender Duel', route: '/games/defender-duel', emoji: '🛸' },
  { id: '1942-duel', title: 'Sky Ace Duel', route: '/games/1942-duel', emoji: '✈️' },
]

const QUICK_MATCH_GAME_ALIASES: Record<string, string> = {
  'bubble-shooter-duel': 'bubble-shooter',
  'brick-break-duel': 'brick-break',
  'color-match-duel': 'color-match',
  'neon-crush-duel': 'neon-crush',
  'color-match': 'color-match',
  'neon-crush': 'neon-crush',
}

export const QUICK_MATCH_SESSION_KEY = 'pm-quick-match-session'

export function resolveUserGender(): FakePortraitGender {
  const profile = readCachedUserProfile()
  if (profile.gender) return profile.gender
  const pref = profile.matchPreference ?? 'female'
  if (pref === 'male') return 'female'
  if (pref === 'female') return 'male'
  return Math.random() > 0.5 ? 'male' : 'female'
}

export function resolveOpponentGender(userGender?: FakePortraitGender): FakePortraitGender {
  const gender = userGender ?? resolveUserGender()
  return gender === 'male' ? 'female' : 'male'
}

function normalizeGameId(gameId: string): string {
  return QUICK_MATCH_GAME_ALIASES[gameId] ?? gameId
}

export function resolveQuickMatchGame(gameId?: string | null): QuickMatchGame | null {
  if (!gameId) return null
  const normalized = normalizeGameId(gameId)
  return QUICK_MATCH_GAMES.find((game) => game.id === normalized) ?? null
}

export function quickMatchPath(gameId?: string): string {
  if (!gameId) return '/games/quick-match'
  return `/games/quick-match?game=${encodeURIComponent(gameId)}`
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

function createBotOpponent(gender: FakePortraitGender): MatchProfile {
  const name = gender === 'female' ? 'PlayBot' : 'Neo-X'
  return {
    id: `bot-${gender}`,
    name,
    age: 22,
    gender,
    portraitSrc: fakePortraitForGender(gender),
    online: true,
    compatibility: 80,
    province: 'Türkiye',
    distance: 'Bot',
    location: 'PlayMeet Bot',
    tags: [{ id: 'bot', label: 'Bot', icon: 'gamepad' }],
    favoriteGames: [{ id: 'duel', label: 'Duel', emoji: '⚔️' }],
    bio: 'Hızlı düello için bot rakip.',
    photos: [
      {
        id: 'bot-1',
        src: fakePortraitForGender(gender),
        objectPosition: '50% 12%',
      },
    ],
  }
}

export async function buildQuickMatchAsync(
  viewerUid: string | null,
  userGender?: FakePortraitGender,
  gameId?: string | null,
): Promise<QuickMatchResult> {
  const opponentGender = resolveOpponentGender(userGender)
  const fixedGame = resolveQuickMatchGame(gameId)
  const game = fixedGame ?? pickRandom(QUICK_MATCH_GAMES)

  if (viewerUid && isFirebaseConfigured()) {
    const pool = await fetchDiscoverProfiles(viewerUid, opponentGender)
    if (pool.length > 0) {
      return { opponent: pickRandom(pool), game }
    }
  }

  return { opponent: createBotOpponent(opponentGender), game }
}

/** @deprecated sync fallback — QuickMatchScreen uses buildQuickMatchAsync */
export function buildQuickMatch(userGender?: FakePortraitGender, gameId?: string | null): QuickMatchResult {
  const opponentGender = resolveOpponentGender(userGender)
  const fixedGame = resolveQuickMatchGame(gameId)
  const game = fixedGame ?? pickRandom(QUICK_MATCH_GAMES)
  return { opponent: createBotOpponent(opponentGender), game }
}

export function persistQuickMatchSession(result: QuickMatchResult) {
  try {
    sessionStorage.setItem(
      QUICK_MATCH_SESSION_KEY,
      JSON.stringify({
        opponent: {
          id: result.opponent.id,
          name: result.opponent.name,
          age: result.opponent.age,
          gender: result.opponent.gender,
          portraitSrc: result.opponent.portraitSrc,
          portraitPosition: result.opponent.photos[0]?.objectPosition ?? '50% 12%',
        },
        game: result.game,
        createdAt: Date.now(),
      }),
    )
  } catch {
    /* ignore */
  }
}

export function readQuickMatchSession(): {
  opponent: {
    id: string
    name: string
    age: number
    gender: FakePortraitGender
    portraitSrc: string
    portraitPosition: string
  }
  game: QuickMatchGame
} | null {
  try {
    const raw = sessionStorage.getItem(QUICK_MATCH_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function opponentGenderLabel(gender: FakePortraitGender): string {
  return gender === 'female' ? 'Kadın oyuncu' : 'Erkek oyuncu'
}
