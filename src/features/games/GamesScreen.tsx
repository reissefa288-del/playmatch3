import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiChevronRight, FiSearch, FiSliders, FiUserPlus, FiUsers, FiZap } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import { useProfileLevel } from '../profile/ProfileLevelProvider'
import { XP_GAME_FEATURED, XP_GAME_POPULAR } from '../profile/profileLevel'
import { allGamesCards, featuredGames, gamesHeroStats, popularGamesCards, type FeaturedGame, type GamesMiniCard } from './data'
import { FeaturedGamesRow } from './components/FeaturedGamesRow'
import oyunReference from '../../reference/oyun.png'

export function GamesScreen() {
  const { addXp } = useProfileLevel()
  const navigate = useNavigate()
  const location = useLocation()
  const [onlineCount, setOnlineCount] = useState(3842)
  const [activeMatches, setActiveMatches] = useState(42)
  const gamesVars = {
    '--pm-games-reference': `url(${oyunReference})`,
  } as CSSProperties
  const heroStats = useMemo(
    () =>
      gamesHeroStats.map((stat) => ({
        ...stat,
        label: stat.id === 'online' ? `${formatTrNumber(onlineCount)} oyuncu çevrimiçi` : `${activeMatches} aktif maç`,
      })),
    [activeMatches, onlineCount],
  )
  const catalogMode = location.pathname === '/games/popular' ? 'popular' : location.pathname === '/games/library' ? 'library' : null

  const openXox = useCallback(() => {
    navigate('/games/xox')
  }, [navigate])

  const openBubbleShooter = useCallback(() => {
    navigate('/games/bubble-shooter')
  }, [navigate])

  const openBrickBreak = useCallback(() => {
    navigate('/games/brick-break')
  }, [navigate])

  const openBlockDuel = useCallback(() => {
    navigate('/games/block-duel')
  }, [navigate])

  const handleFeaturedPlay = useCallback(
    (game: FeaturedGame) => {
      if (game.id === 'bubble-shooter-duel') {
        openBubbleShooter()
        return
      }
      if (game.id === 'block-duel') {
        openBlockDuel()
        return
      }
      if (game.id === 'xox-featured') {
        openXox()
        return
      }
      addXp(XP_GAME_FEATURED)
    },
    [addXp, openBlockDuel, openBrickBreak, openBubbleShooter, openXox],
  )

  const handleMiniCardClick = useCallback(
    (game: GamesMiniCard, xp: number) => {
      if (isBubbleShooterGame(game)) {
        openBubbleShooter()
        return
      }
      if (isBrickBreakGame(game)) {
        openBrickBreak()
        return
      }
      if (isBlockDuelGame(game)) {
        openBlockDuel()
        return
      }
      if (isXoxGame(game)) {
        openXox()
        return
      }
      addXp(xp)
    },
    [addXp, openBlockDuel, openBrickBreak, openBubbleShooter, openXox],
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setOnlineCount((current) => clamp(current + randomInt(-38, 56), 3600, 4300))
      setActiveMatches((current) => clamp(current + randomInt(-2, 3), 34, 62))
    }, 2300)
    return () => window.clearInterval(timer)
  }, [])

  if (catalogMode) {
    const cards = catalogMode === 'popular' ? popularGamesCards : allGamesCards
    const title = catalogMode === 'popular' ? 'Popüler Oyunlar' : 'Tüm Oyunlar'
    const xp = catalogMode === 'popular' ? XP_GAME_FEATURED : XP_GAME_POPULAR

    return (
      <>
        <div className="pm-app-shell pm-app-shell--games" style={gamesVars}>
          <motion.div className="pm-artboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AmbientParticles />
            <main className="pm-games pm-games-all">
              <Navbar />
              <header className="pm-games-all__head">
                <button type="button" className="pm-games-all__back" onClick={() => navigate('/games')}>
                  <FiArrowLeft />
                </button>
                <div>
                  <p>Oyun Kataloğu</p>
                  <h2>{title}</h2>
                </div>
              </header>
              <section className="pm-games-all__panel">
                <div className="pm-games-all__grid" role="list">
                  {cards.map((game) => (
                    <article
                      key={game.id}
                      className={`pm-games-mini-card ${game.color} ${game.isMore ? 'is-more' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleMiniCardClick(game, xp)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          handleMiniCardClick(game, xp)
                        }
                      }}
                    >
                    {game.badge ? <span className="pm-games-mini-card__badge">{game.badge}</span> : null}
                    <div className={`pm-games-mini-card__art is-${game.artKind}`} aria-hidden>
                      <game.icon className="pm-games-mini-card__icon" />
                    </div>
                    <strong>{game.title}</strong>
                    <small>
                      <FiUsers /> {game.players}
                    </small>
                  </article>
                  ))}
                </div>
              </section>
            </main>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
    <div className="pm-app-shell pm-app-shell--games" style={gamesVars}>
      <motion.div className="pm-artboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AmbientParticles />
        <main className="pm-games">
          <Navbar />
          <div className="pm-games-hero-block">
            <section className="pm-games-hero">
              <p className="pm-games-hero__eyebrow">PLAYMEST SOCIAL HUB</p>
            </section>
            <div className="pm-games-hero__stats pm-games-hero__stats--below">
              {heroStats.map((stat) => (
                <span key={stat.id} className={`pm-games-hero__stat-pill is-${stat.id}`}>
                  <stat.icon aria-hidden />
                  <span>{stat.label}</span>
                </span>
              ))}
            </div>
          </div>

          <motion.div className="pm-games-search" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <label className="pm-games-search__field">
              <FiSearch aria-hidden />
              <input type="text" placeholder="Oyun ara..." aria-label="Oyun ara" />
            </label>
            <button type="button" className="pm-games-search__filter" aria-label="Filtrele">
              <FiSliders />
            </button>
          </motion.div>

          <FeaturedGamesRow games={featuredGames} onPlay={handleFeaturedPlay} />

          <section className="pm-games-shelf pm-games-shelf--popular">
            <header className="pm-games-shelf__head">
              <h3>Popüler Oyunlar</h3>
              <button type="button" onClick={() => navigate('/games/popular')}>
                Tümünü Gör <FiChevronRight />
              </button>
            </header>
            <div className="pm-games-shelf__row" role="list">
              {popularGamesCards.map((game) => (
                <article
                  key={game.id}
                  className={`pm-games-mini-card ${game.color}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleMiniCardClick(game, XP_GAME_FEATURED)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleMiniCardClick(game, XP_GAME_FEATURED)
                    }
                  }}
                >
                  <span className="pm-games-mini-card__badge">{game.badge}</span>
                  <div className={`pm-games-mini-card__art is-${game.artKind}`} aria-hidden>
                    <game.icon className="pm-games-mini-card__icon" />
                  </div>
                  <strong>{game.title}</strong>
                  <small>
                    <FiUsers /> {game.players}
                  </small>
                </article>
              ))}
            </div>
          </section>

          <section className="pm-games-shelf pm-games-shelf--all">
            <header className="pm-games-shelf__head">
              <h3>Tüm Oyunlar</h3>
              <button type="button" onClick={() => navigate('/games/library')}>
                Tümünü Gör <FiChevronRight />
              </button>
            </header>
            <div className="pm-games-shelf__row" role="list">
              {allGamesCards.map((game) => (
                <article
                  key={game.id}
                  className={`pm-games-mini-card ${game.color} ${game.isMore ? 'is-more' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleMiniCardClick(game, XP_GAME_POPULAR)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleMiniCardClick(game, XP_GAME_POPULAR)
                    }
                  }}
                >
                  <div className={`pm-games-mini-card__art is-${game.artKind}`} aria-hidden>
                    <game.icon className="pm-games-mini-card__icon" />
                  </div>
                  <strong>{game.title}</strong>
                  <small>
                    <FiUsers /> {game.players}
                  </small>
                </article>
              ))}
            </div>
          </section>

          <section className="pm-games-cta-grid">
            <article className="pm-games-cta-card is-random">
              <div className="pm-games-cta-card__visual is-random" aria-hidden>
                <FiZap />
              </div>
              <p className="pm-games-cta-card__eyebrow">
                <FiZap /> HIZLI EŞLEŞME
              </p>
              <h4>RASTGELE OYNA</h4>
              <p>Hızlı eşleş, rastgele rakiplerle mücadele et!</p>
              <small>
                <span className="pm-games-online-dot" /> 2.148 oyuncu oynuyor
              </small>
              <button type="button" onClick={openXox}>
                <FiZap /> HEMEN OYNA
              </button>
            </article>

            <article className="pm-games-cta-card is-friends">
              <div className="pm-games-cta-card__visual is-friends" aria-hidden>
                <FiUsers />
                <FiUserPlus />
              </div>
              <p className="pm-games-cta-card__eyebrow">
                <FiUsers /> ARKADAŞLARINLA
              </p>
              <h4>OYNA</h4>
              <p>Arkadaşını davet et ve özel odada oynayın!</p>
              <small>
                <span className="pm-games-online-dot" /> 512 oda aktif
              </small>
              <button type="button" onClick={openXox}>
                <FiUserPlus /> DAVET ET
              </button>
            </article>
          </section>
        </main>
      </motion.div>
    </div>
    </>
  )
}

function isBubbleShooterGame(game: GamesMiniCard) {
  return game.id === 'bubble-shooter-duel' || game.artKind === 'bubble-shooter'
}

function isXoxGame(game: GamesMiniCard) {
  return game.id === 'xox' || game.artKind === 'xox'
}

function isBrickBreakGame(game: GamesMiniCard) {
  return game.id === 'brick-break-duel' || game.artKind === 'brick-break'
}

function isBlockDuelGame(game: GamesMiniCard) {
  return game.id === 'block-duel' || game.artKind === 'block-duel'
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function formatTrNumber(value: number) {
  return value.toLocaleString('tr-TR')
}
