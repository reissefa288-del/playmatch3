import '../../styles/games-quick-match.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AmbientParticles } from '../home/components/AmbientParticles'
import {
  buildQuickMatch,
  opponentGenderLabel,
  persistQuickMatchSession,
  resolveOpponentGender,
  resolveQuickMatchGame,
  resolveUserGender,
  type QuickMatchResult,
} from './quickMatch'

type QuickMatchPhase = 'searching' | 'found' | 'launching'

const SEARCH_MS_MIN = 2600
const SEARCH_MS_MAX = 4200
const FOUND_MS = 1900

function randomSearchDelay() {
  return SEARCH_MS_MIN + Math.floor(Math.random() * (SEARCH_MS_MAX - SEARCH_MS_MIN))
}

export function QuickMatchScreen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedGameId = searchParams.get('game')
  const selectedGame = useMemo(() => resolveQuickMatchGame(selectedGameId), [selectedGameId])
  const [phase, setPhase] = useState<QuickMatchPhase>('searching')
  const [match, setMatch] = useState<QuickMatchResult | null>(null)
  const [statusLine, setStatusLine] = useState('Rakip aranıyor…')

  const userGender = useMemo(() => resolveUserGender(), [])
  const targetGender = useMemo(
    () => resolveOpponentGender(userGender),
    [userGender],
  )

  const goBack = useCallback(() => {
    navigate('/games', { replace: true })
  }, [navigate])

  useEffect(() => {
    const result = buildQuickMatch(userGender, selectedGameId)
    const gameStatusLine = selectedGame
      ? `${selectedGame.title} lobisi açılıyor…`
      : 'Rastgele oyun seçiliyor…'
    const statusTimers = [
      window.setTimeout(() => setStatusLine('Uygun lobiler taranıyor…'), 700),
      window.setTimeout(() => setStatusLine(`${opponentGenderLabel(targetGender)} aranıyor…`), 1400),
      window.setTimeout(() => setStatusLine(gameStatusLine), 2100),
    ]

    const foundTimer = window.setTimeout(() => {
      setMatch(result)
      persistQuickMatchSession(result)
      setPhase('found')
      setStatusLine(`${result.opponent.name} ile eşleşildi!`)
    }, randomSearchDelay())

    return () => {
      statusTimers.forEach((timer) => window.clearTimeout(timer))
      window.clearTimeout(foundTimer)
    }
  }, [selectedGame, selectedGameId, targetGender, userGender])

  useEffect(() => {
    if (phase !== 'found' || !match) return

    const launchTimer = window.setTimeout(() => {
      setPhase('launching')
      navigate(match.game.route, { replace: true })
    }, FOUND_MS)

    return () => window.clearTimeout(launchTimer)
  }, [match, navigate, phase])

  return (
    <div className="pm-app-shell pm-app-shell--games pm-app-shell--quick-match">
      <motion.div className="pm-artboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AmbientParticles />
        <main className="pm-quick-match">
          <header className="pm-quick-match__head">
            <button type="button" className="pm-quick-match__back" onClick={goBack} aria-label="Geri">
              <FiArrowLeft />
            </button>
            <div>
              <p>Hızlı Eşleşme</p>
              <h1>{selectedGame?.title ?? 'Rastgele Oyna'}</h1>
            </div>
          </header>

          <section className="pm-quick-match__stage" aria-live="polite">
            <div className={`pm-quick-match__radar${phase === 'found' ? ' is-found' : ''}`}>
              <span className="pm-quick-match__radar-ring pm-quick-match__radar-ring--a" aria-hidden />
              <span className="pm-quick-match__radar-ring pm-quick-match__radar-ring--b" aria-hidden />
              <span className="pm-quick-match__radar-ring pm-quick-match__radar-ring--c" aria-hidden />
              <span className="pm-quick-match__radar-core" aria-hidden>
                <FiZap />
              </span>

              {match && phase !== 'searching' ? (
                <motion.div
                  className="pm-quick-match__opponent"
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                >
                  <div
                    className="pm-quick-match__opponent-portrait"
                    style={{
                      backgroundImage: `url(${match.opponent.portraitSrc})`,
                      backgroundPosition: match.opponent.photos[0]?.objectPosition ?? '50% 12%',
                    }}
                  />
                  <strong>{match.opponent.name}</strong>
                  <span>{match.opponent.age} · {opponentGenderLabel(match.opponent.gender)}</span>
                </motion.div>
              ) : null}
            </div>

            <p className="pm-quick-match__status">{statusLine}</p>
            <p className="pm-quick-match__hint">
              {userGender === 'male' ? 'Erkek' : 'Kadın'} oyuncu olarak{' '}
              {targetGender === 'female' ? 'kadın' : 'erkek'} rakiple eşleşiyorsun
            </p>

            {match && phase !== 'searching' ? (
              <motion.div
                className="pm-quick-match__game-pill"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span aria-hidden>{match.game.emoji}</span>
                <div>
                  <small>Oyun</small>
                  <strong>{match.game.title}</strong>
                </div>
                <span className="pm-quick-match__game-pill__go">
                  {phase === 'launching' ? 'Başlatılıyor…' : 'Hazır'}
                </span>
              </motion.div>
            ) : null}
          </section>
        </main>
      </motion.div>
    </div>
  )
}
