import { useEffect, useMemo, useState } from 'react'
import { FiMessageCircle, FiSearch, FiX } from 'react-icons/fi'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { matchedProfiles } from '../../match/data'
import type { MatchProfile } from '../../match/data'

type NewChatSheetProps = {
  open: boolean
  onClose: () => void
}

function normalizeQuery(value: string) {
  return value.trim().toLocaleLowerCase('tr-TR')
}

function profileMatchesQuery(profile: MatchProfile, query: string) {
  if (!query) return true
  return (
    profile.name.toLocaleLowerCase('tr-TR').includes(query) ||
    profile.province.toLocaleLowerCase('tr-TR').includes(query) ||
    profile.location.toLocaleLowerCase('tr-TR').includes(query) ||
    profile.favoriteGames.some((game) => game.label.toLocaleLowerCase('tr-TR').includes(query))
  )
}

export function NewChatSheet({ open, onClose }: NewChatSheetProps) {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [query, setQuery] = useState('')

  const filteredProfiles = useMemo(() => {
    const normalized = normalizeQuery(query)
    return matchedProfiles.filter((profile) => profileMatchesQuery(profile, normalized))
  }, [query])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  function startChat(profileId: string) {
    onClose()
    navigate(`/chat/${profileId}`)
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="pm-chat-new-sheet__backdrop"
            aria-label="Kapat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            className="pm-chat-new-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pm-chat-new-sheet-title"
            style={{ x: '-50%', y: '-50%' }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.94, x: '-50%', y: '-50%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <header className="pm-chat-new-sheet__head">
              <div>
                <h2 id="pm-chat-new-sheet-title">
                  <FiMessageCircle aria-hidden /> Yeni Sohbet
                </h2>
                <p>Eşleştiğin kişilerden birini seç</p>
              </div>
              <button
                type="button"
                className="pm-chat-new-sheet__close"
                onClick={onClose}
                aria-label="Kapat"
              >
                <FiX />
              </button>
            </header>

            <label className="pm-chat-new-sheet__search">
              <FiSearch aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Eşleşme ara..."
                aria-label="Eşleşme ara"
              />
            </label>

            <ul className="pm-chat-new-sheet__list">
              {filteredProfiles.length === 0 ? (
                <li className="pm-chat-new-sheet__empty">Eşleşme bulunamadı</li>
              ) : (
                filteredProfiles.map((profile) => (
                  <li key={profile.id}>
                    <button
                      type="button"
                      className="pm-chat-new-sheet__row"
                      onClick={() => startChat(profile.id)}
                    >
                      <span
                        className="pm-chat-new-sheet__portrait"
                        style={{
                          backgroundImage: `url(${profile.portraitSrc})`,
                          backgroundPosition: profile.photos[0]?.objectPosition ?? '50% 12%',
                        }}
                        aria-hidden
                      >
                        {profile.online ? <span className="pm-chat-new-sheet__online" aria-hidden /> : null}
                      </span>
                      <span className="pm-chat-new-sheet__body">
                        <strong>
                          {profile.name}
                          <em>{profile.age}</em>
                        </strong>
                        <small>{profile.distance}</small>
                      </span>
                      <span className="pm-chat-new-sheet__action">Sohbet</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  )
}
