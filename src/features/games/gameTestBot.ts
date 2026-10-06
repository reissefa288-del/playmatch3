/**
 * Geçici düello test botu — yayın öncesi kaldırılacak.
 * Kapatmak: .env → VITE_GAME_TEST_BOT=false
 */
import type { MatchProfile } from '../match/data'
import { readCachedUserProfile } from '../profile/userProfileStore'
import {
  fakePortraitForGender,
  type FakePortraitGender,
} from '../../shared/fakePortraits'

/** quickMatch.ts QUICK_MATCH_SESSION_KEY ile aynı olmalı */
const QUICK_MATCH_SESSION_KEY = 'pm-quick-match-session'

export const GAME_TEST_BOT_ID = 'dev-test-bot'
export const GAME_TEST_BOT_NAME = 'Deneme Botu'

export type GameTestBotQuickGame = {
  id: string
  title: string
  route: string
  emoji: string
}

export function shouldUseGameTestBot(): boolean {
  return import.meta.env.VITE_GAME_TEST_BOT !== 'false'
}

export function isGameTestBotPlayerId(playerId: string): boolean {
  return playerId === GAME_TEST_BOT_ID || playerId.startsWith('bot-')
}

function resolveUserGender(): FakePortraitGender {
  const profile = readCachedUserProfile()
  if (profile.gender) return profile.gender
  const pref = profile.matchPreference ?? 'female'
  if (pref === 'male') return 'female'
  if (pref === 'female') return 'male'
  return Math.random() > 0.5 ? 'male' : 'female'
}

export function resolveTestBotOpponentGender(userGender?: FakePortraitGender): FakePortraitGender {
  const gender = userGender ?? resolveUserGender()
  return gender === 'male' ? 'female' : 'male'
}

const HOME_FEMALE_BOTS = [
  'Elif',
  'Zeynep',
  'Defne',
  'Ece',
  'Azra',
  'Selin',
  'İlayda',
  'Damla',
  'Nehir',
  'Lara',
] as const

/** Antalya Muratpaşa check-in listesi için geçici bot. Beğeni gerçek hesaba gitmez. */
export function createMuratpasaCheckInBot(): MatchProfile {
  const portrait = fakePortraitForGender('female')
  return {
    id: 'bot-checkin-muratpasa',
    name: 'Elif · Bot',
    age: 24,
    gender: 'female',
    portraitSrc: portrait,
    online: true,
    compatibility: 0,
    province: 'Antalya',
    distance: 'Burada',
    location: 'Muratpaşa, Antalya',
    tags: [{ id: 'checkin-bot', label: 'Bot', icon: 'gamepad' }],
    favoriteGames: [{ id: 'duel', label: 'Duel', emoji: '🎮' }],
    bio: 'Muratpaşa’da check-in yaptı.',
    photos: [{ id: 'bot-checkin-muratpasa', src: portrait, objectPosition: '50% 12%' }],
  }
}

/** Ana sayfa destesi — gerçek profil değil, ekran boş kalmasın diye. */
export function createHomeFemaleBots(): MatchProfile[] {
  const portrait = fakePortraitForGender('female')
  return HOME_FEMALE_BOTS.map((name, index) => ({
    id: `bot-home-${index + 1}`,
    name: `${name} · Bot`,
    age: 21 + index,
    gender: 'female' as const,
    portraitSrc: portrait,
    online: index % 2 === 0,
    compatibility: 0,
    province: 'Bot',
    distance: `${index + 1} km`,
    location: 'Bot',
    tags: [{ id: 'home-bot', label: 'Bot', icon: 'gamepad' as const }],
    favoriteGames: [{ id: 'duel', label: 'Duel', emoji: '🎮' }],
    bio: 'Ana sayfa denemesi için geçici bot profil.',
    photos: [{ id: `home-bot-${index + 1}`, src: portrait, objectPosition: '50% 12%' }],
  }))
}

export function mergeHomeFemaleBots(profiles: MatchProfile[]): MatchProfile[] {
  const bots = createHomeFemaleBots()
  const rest = profiles.filter((profile) => !profile.id.startsWith('bot-home-'))
  return [...bots, ...rest]
}

export function createGameTestBotOpponent(
  gender: FakePortraitGender = resolveTestBotOpponentGender(),
): MatchProfile {
  return {
    id: GAME_TEST_BOT_ID,
    name: GAME_TEST_BOT_NAME,
    age: 22,
    gender,
    portraitSrc: fakePortraitForGender(gender),
    online: true,
    compatibility: 100,
    province: 'Test',
    distance: 'Bot',
    location: 'Yerel test rakibi',
    tags: [{ id: 'test-bot', label: 'Test bot', icon: 'gamepad' }],
    favoriteGames: [{ id: 'duel', label: 'Duel', emoji: '🤖' }],
    bio: 'Oyunları denemek için geçici bot rakip.',
    photos: [
      {
        id: 'test-bot-1',
        src: fakePortraitForGender(gender),
        objectPosition: '50% 12%',
      },
    ],
  }
}

export function persistTestBotSession(
  opponent: MatchProfile,
  game: GameTestBotQuickGame,
) {
  try {
    sessionStorage.setItem(
      QUICK_MATCH_SESSION_KEY,
      JSON.stringify({
        opponent: {
          id: opponent.id,
          name: opponent.name,
          age: opponent.age,
          gender: opponent.gender,
          portraitSrc: opponent.portraitSrc,
          portraitPosition: opponent.photos[0]?.objectPosition ?? '50% 12%',
        },
        game,
        createdAt: Date.now(),
      }),
    )
  } catch {
    /* ignore */
  }
}

export function beginTestBotGame(game: GameTestBotQuickGame, userGender?: FakePortraitGender) {
  const opponent = createGameTestBotOpponent(resolveTestBotOpponentGender(userGender))
  persistTestBotSession(opponent, game)
  return opponent
}
