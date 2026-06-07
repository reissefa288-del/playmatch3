import '../../styles/games.css'
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiSearch, FiSliders, FiUserPlus, FiUsers, FiZap } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { useRuntimeActive } from '../../shared/useRuntimeActive'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import { useProfileLevelActions } from '../profile/ProfileLevelProvider'
import { XP_GAME_FEATURED } from '../profile/profileLevel'
import { featuredGames, gamesHeroStats, popularGamesCards, type FeaturedGame, type GamesMiniCard } from './data'
import { FeaturedGamesRow } from './components/FeaturedGamesRow'
import { AllGamesRow } from './components/AllGamesRow'
import { GamesCatalogGrid } from './components/GamesCatalogGrid'
import { GameInviteSheet } from './components/GameInviteSheet'
import { preloadSnakeDuel } from './snakeDuelPreload'
import { prefetchPopularGameRoutes } from '../../navigation/prefetchRoutes'
import { quickMatchPath } from './quickMatch'
import oyunReference from '../../reference/opt/thumb/oyun.webp'

export function GamesScreen() {
  const { addXp } = useProfileLevelActions()
  const visible = useRuntimeActive('games')
  const navigate = useNavigate()
  const location = useLocation()
  const [onlineCount, setOnlineCount] = useState(3842)
  const [activeMatches, setActiveMatches] = useState(42)
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false)
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
  const isPopularCatalog = location.pathname === '/games/popular'

  const openInviteSheet = useCallback(() => {
    setInviteSheetOpen(true)
  }, [])

  const closeInviteSheet = useCallback(() => {
    setInviteSheetOpen(false)
  }, [])

  const inviteSheetPortal =
    typeof document !== 'undefined'
      ? createPortal(
          <GameInviteSheet open={inviteSheetOpen} onClose={closeInviteSheet} />,
          document.body,
        )
      : null

  const openQuickMatch = useCallback(() => {
    navigate('/games/quick-match')
  }, [navigate])

  const openQuickMatchForGame = useCallback(
    (gameId: string) => {
      navigate(quickMatchPath(gameId))
    },
    [navigate],
  )

  const handleFeaturedPlay = useCallback(
    (game: FeaturedGame) => {
      addXp(XP_GAME_FEATURED)
      openQuickMatchForGame(game.id)
    },
    [addXp, openQuickMatchForGame],
  )

  const handleMiniCardClick = useCallback(
    (game: GamesMiniCard, xp: number) => {
      if (game.isMore) return
      addXp(xp)
      openQuickMatchForGame(game.id)
    },
    [addXp, openQuickMatchForGame],
  )

  useEffect(() => {
    if (!visible) return
    prefetchPopularGameRoutes()
    const timer = window.setInterval(() => {
      setOnlineCount((current) => clamp(current + randomInt(-38, 56), 3600, 4300))
      setActiveMatches((current) => clamp(current + randomInt(-2, 3), 34, 62))
    }, 2300)
    return () => window.clearInterval(timer)
  }, [visible])

  if (isPopularCatalog) {
    const xp = XP_GAME_FEATURED

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
                  <h2>Tüm Oyunlar</h2>
                </div>
              </header>
              <section className="pm-games-all__panel">
                <GamesCatalogGrid
                  games={popularGamesCards}
                  onPlay={(game) => handleMiniCardClick(game, xp)}
                  getCardHandlers={snakeDuelPreloadHandlers}
                />
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

          <AllGamesRow
            games={popularGamesCards}
            onPlay={(game) => handleMiniCardClick(game, XP_GAME_FEATURED)}
            onShowAll={() => navigate('/games/popular')}
            getCardHandlers={snakeDuelPreloadHandlers}
          />

          <section className="pm-games-cta-grid">
            <article className="pm-games-cta-card is-random">
              <span className="pm-games-cta-card__edge" aria-hidden />
              <span className="pm-games-cta-card__glow" aria-hidden />

              <div className="pm-games-cta-card__top">
                <div className="pm-games-cta-card__visual is-random" aria-hidden>
                  <FiZap />
                </div>
                <p className="pm-games-cta-card__eyebrow">
                  <FiZap /> Hızlı Eşleşme
                </p>
              </div>

              <div className="pm-games-cta-card__title">
                <span>Rastgele</span>
                <strong>Oyna</strong>
              </div>

              <p className="pm-games-cta-card__desc">
                Karşı cinsiyetten rakiple hızlı eşleş, rastgele oyuna dal!
              </p>

              <div className="pm-games-cta-card__stat">
                <span className="pm-games-online-dot" />
                <span>2.148 oyuncu oynuyor</span>
              </div>

              <button type="button" onClick={openQuickMatch}>
                <span className="pm-games-cta-card__btn-shine" aria-hidden />
                <FiZap /> Hemen Oyna
              </button>
            </article>

            <article className="pm-games-cta-card is-friends">
              <span className="pm-games-cta-card__edge" aria-hidden />
              <span className="pm-games-cta-card__glow" aria-hidden />

              <div className="pm-games-cta-card__top">
                <div className="pm-games-cta-card__visual is-friends" aria-hidden>
                  <FiUserPlus />
                </div>
                <p className="pm-games-cta-card__eyebrow">
                  <FiUsers /> Arkadaşlarınla
                </p>
              </div>

              <div className="pm-games-cta-card__title">
                <span>Özel</span>
                <strong>Oda</strong>
              </div>

              <p className="pm-games-cta-card__desc">
                Eşleştiğin oyuncuları davet et, birlikte özel odada oyna!
              </p>

              <div className="pm-games-cta-card__stat">
                <span className="pm-games-online-dot" />
                <span>512 oda aktif</span>
              </div>

              <button type="button" onClick={openInviteSheet}>
                <span className="pm-games-cta-card__btn-shine" aria-hidden />
                <FiUserPlus /> Davet Et
              </button>
            </article>
          </section>
        </main>
      </motion.div>
    </div>
    {inviteSheetPortal}
    </>
  )
}

function isSnakeDuelGame(game: GamesMiniCard) {
  return game.id === 'snake-duel' || game.artKind === 'snake-duel' || game.artKind === 'snake'
}

function snakeDuelPreloadHandlers(game: GamesMiniCard) {
  if (!isSnakeDuelGame(game)) return {}
  return { onPointerEnter: () => void preloadSnakeDuel() }
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
