import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiHeart, FiX } from 'react-icons/fi'
import '../../styles/crossed.css'
import { useAuthSession } from '../auth/useAuthSession'
import { isGameTestBotPlayerId } from '../games/gameTestBot'
import { useDailyLikes } from '../likes/useDailyLikes'
import { MatchProfileCard } from './components/MatchProfileCard'
import { markCrossingLiked, refreshCrossingsDay, useCrossings, type Crossing } from './crossingsStore'
import { sendLikeAndRefresh } from './matchConnectionsStore'

function whenLabel(at: number) {
  const minutes = Math.max(0, Math.round((Date.now() - at) / 60000))
  if (minutes < 1) return 'Az önce'
  if (minutes < 60) return `${minutes} dk önce`
  const hours = Math.round(minutes / 60)
  return `${hours} sa önce`
}

function CrossedRow({ person, onOpen }: { person: Crossing; onOpen: () => void }) {
  const { session } = useAuthSession()
  const { tryConsumeLike, remaining, isUnlimited } = useDailyLikes()
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const sent = person.liked

  async function like() {
    if (sent || busy) return
    const uid = session?.uid
    if (!uid) {
      markCrossingLiked(person.profile.id)
      return
    }
    if (!isUnlimited && remaining <= 0) {
      setNote('Hak bitti')
      return
    }
    setBusy(true)
    try {
      if (!(await tryConsumeLike())) {
        setNote('Hak bitti')
        return
      }
      if (!isGameTestBotPlayerId(person.profile.id)) {
        await sendLikeAndRefresh(uid, person.profile.id, 'discover')
      }
      markCrossingLiked(person.profile.id)
    } catch {
      setNote('Gönderilemedi')
    } finally {
      setBusy(false)
    }
  }

  const profile = person.profile

  return (
    <li className="pm-crossed__row">
      <button type="button" className="pm-crossed__open" onClick={onOpen}>
        {profile.portraitSrc ? (
          <img className="pm-crossed__photo" src={profile.portraitSrc} alt="" />
        ) : (
          <span className="pm-crossed__photo pm-crossed__photo--empty" aria-hidden>
            {profile.name.slice(0, 1)}
          </span>
        )}
        <span className="pm-crossed__meta">
          <strong>
            {profile.name}, {profile.age}
          </strong>
          <span>{profile.location || profile.province}</span>
          <span>
            {person.count > 1 ? `${person.count} kez karşılaştınız` : '1 kez karşılaştınız'} ·{' '}
            {whenLabel(person.lastAt)}
          </span>
        </span>
      </button>
      <button type="button" className="pm-crossed__like" disabled={sent || busy} onClick={() => void like()}>
        <FiHeart aria-hidden />
        {sent ? 'Gönderildi' : (note ?? 'Beğen')}
      </button>
    </li>
  )
}

export function CrossedToday() {
  const people = useCrossings()
  const person = people[0] ?? null
  const [open, setOpen] = useState(false)

  useEffect(() => {
    refreshCrossingsDay()
  }, [])

  return (
    <section className="pm-crossed" aria-label="Bugün karşılaştığın kişiler">
      <header className="pm-crossed__head">
        <h2>Bugün karşılaştıkların</h2>
      </header>
      {person ? (
        <ol className="pm-crossed__list">
          <CrossedRow person={person} onOpen={() => setOpen(true)} />
        </ol>
      ) : (
        <p className="pm-crossed__empty">Henüz kimse yok. Bir profil açılınca burada belirir.</p>
      )}
      {open && person
        ? createPortal(
            <div className="pm-crossed-card">
              <button type="button" className="pm-crossed-card__backdrop" aria-label="Kapat" onClick={() => setOpen(false)} />
              <div className="pm-crossed-card__sheet" role="dialog" aria-modal="true" aria-label={person.profile.name}>
                <button type="button" className="pm-crossed-card__close" aria-label="Kapat" onClick={() => setOpen(false)}>
                  <FiX />
                </button>
                <MatchProfileCard profile={person.profile} />
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  )
}
