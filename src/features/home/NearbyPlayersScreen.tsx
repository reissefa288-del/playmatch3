import { useMemo } from 'react'
import { FiArrowLeft, FiMapPin, FiUsers } from 'react-icons/fi'
import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AmbientParticles } from './components/AmbientParticles'
import { Navbar } from './components/Navbar'
import { NearbyPlayersList } from './components/NearbyPlayersList'
import { filterNearbyPlayers } from './filterDiscovery'
import { nearbyListLiveCaption, nearbyPlayers } from './data'
import { useHomeFilters } from './useHomeFilters'
import { useLiveSocialStats } from './useLiveSocialStats'

export function NearbyPlayersScreen() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const live = useLiveSocialStats()
  const { applied } = useHomeFilters()

  const visibleNearby = useMemo(
    () => filterNearbyPlayers(nearbyPlayers, applied),
    [applied],
  )

  return (
    <motion.div className="pm-app-shell pm-app-shell--nearby">
      <div className="pm-artboard">
        <AmbientParticles />
        <main className="pm-nearby-screen">
          <Navbar />

          <motion.header
            className="pm-nearby-screen__hero"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <button
              type="button"
              className="pm-nearby-screen__back"
              onClick={() => navigate(-1)}
              aria-label="Geri"
            >
              <FiArrowLeft />
            </button>

            <motion.div className="pm-nearby-screen__hero-copy">
              <span className="pm-nearby-screen__badge">CANLI LOBİ</span>
              <h1>
                <FiMapPin aria-hidden /> Yakındaki Oyuncular
              </h1>
              <p>{nearbyListLiveCaption.sectionEyebrow}</p>
              <motion.div className="pm-nearby-screen__stats" aria-hidden>
                <span>{live.activePlayersLabel}</span>
                <span>·</span>
                <span>{live.waitLabel}</span>
              </motion.div>
            </motion.div>

            <div className="pm-nearby-screen__count" aria-label={`${visibleNearby.length} oyuncu`}>
              <FiUsers aria-hidden />
              <strong>{visibleNearby.length}</strong>
            </div>
          </motion.header>

          <NearbyPlayersList players={visibleNearby} />
        </main>
      </div>
    </motion.div>
  )
}
