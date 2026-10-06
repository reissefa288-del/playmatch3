import { useState } from 'react'
import { useAuthSession } from '../auth/useAuthSession'
import { isGameTestBotPlayerId } from '../games/gameTestBot'
import { useDailyLikes } from '../likes/useDailyLikes'
import { sendLikeAndRefresh } from '../match/matchConnectionsStore'
import { useUserProfile } from '../onboarding/useUserProfile'
import type { HerePerson } from './firestoreCheckIn'

type FeedRow = {
  id: string
  name: string
  photo: string
  checkedInAt: number
  likeId: string | null
}

function ago(at: number): string {
  const mins = Math.max(0, Math.round((Date.now() - at) / 60000))
  if (mins < 1) return 'Az önce'
  if (mins < 60) return `${mins} dk önce`
  const hours = Math.max(1, Math.round(mins / 60))
  return `${hours} sa önce`
}

export function CheckInFeed({
  people,
  youAt,
}: {
  people: HerePerson[]
  youAt?: number | null
}) {
  const { session } = useAuthSession()
  const { profile } = useUserProfile()
  const { tryConsumeLike } = useDailyLikes()
  const [sent, setSent] = useState<Record<string, string>>({})
  const uid = session?.uid ?? null

  const rows: FeedRow[] = people.map((person) => ({
    id: person.profile.id,
    name: person.profile.name,
    photo: person.profile.portraitSrc,
    checkedInAt: person.checkedInAt,
    likeId: person.profile.id,
  }))

  if (youAt) {
    rows.push({
      id: 'you',
      name: profile.name.trim() || 'Sen',
      photo: profile.photoUrl,
      checkedInAt: youAt,
      likeId: null,
    })
  }

  rows.sort((a, b) => b.checkedInAt - a.checkedInAt)

  async function sendLike(row: FeedRow) {
    if (!row.likeId || sent[row.likeId]) return
    if (uid) {
      const ok = await tryConsumeLike()
      if (!ok) {
        setSent((current) => ({ ...current, [row.likeId!]: 'Hak bitti' }))
        return
      }
      if (!isGameTestBotPlayerId(row.likeId)) {
        try {
          await sendLikeAndRefresh(uid, row.likeId, 'discover')
        } catch {
          setSent((current) => ({ ...current, [row.likeId!]: 'Gönderilemedi' }))
          return
        }
      }
    }
    setSent((current) => ({ ...current, [row.likeId!]: 'Gönderildi' }))
  }

  if (rows.length === 0) {
    return <p className="pm-checkin-feed__empty">Şu an bu ilçede başka kimse yok.</p>
  }

  return (
    <ol className="pm-checkin-feed">
      {rows.map((row) => (
        <li key={row.id} className="pm-checkin-feed__row">
          {row.photo ? (
            <img src={row.photo} alt="" className="pm-checkin-feed__photo" />
          ) : (
            <span className="pm-checkin-feed__photo pm-checkin-feed__photo--empty" aria-hidden>
              {row.name.slice(0, 1)}
            </span>
          )}
          <span className="pm-checkin-feed__meta">
            <strong>{row.name}</strong>
            <span>{ago(row.checkedInAt)} check-in yaptı</span>
          </span>
          {row.likeId ? (
            <button
              type="button"
              className={sent[row.likeId] === 'Gönderildi' ? 'is-sent' : ''}
              disabled={Boolean(sent[row.likeId])}
              onClick={() => void sendLike(row)}
            >
              {sent[row.likeId] ?? 'Beğen'}
            </button>
          ) : (
            <span className="pm-checkin-feed__you">Sen</span>
          )}
        </li>
      ))}
    </ol>
  )
}
