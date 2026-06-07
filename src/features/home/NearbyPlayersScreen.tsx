import { useMemo } from 'react'
import { FiArrowLeft, FiMapPin } from 'react-icons/fi'
import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AmbientParticles } from './components/AmbientParticles'
import { Navbar } from './components/Navbar'
import { NearbyPlayersList } from './components/NearbyPlayersList'
import { filterNearbyPlayers } from './filterDiscovery'
import { nearbyPlayers } from './data'
import { useHomeFilters } from './useHomeFilters'

export function NearbyPlayersScreen() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
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
              onClick={() => navigate('/', { replace: true })}
              aria-label="Ana sayfaya dön"
            >
              <span className="pm-nearby-screen__back-icon" aria-hidden>
                <FiArrowLeft />
              </span>
              <span className="pm-nearby-screen__back-label">Geri</span>
            </button>

            <h1 className="pm-nearby-screen__title">
              <FiMapPin aria-hidden /> Yakındaki Oyuncular
            </h1>
          </motion.header>

          <NearbyPlayersList players={visibleNearby} />
        </main>
      </div>
    </motion.div>
  )
}
