import { FiSearch, FiSliders, FiUsers } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { gamesLiveHub } from '../data'

export function GamesHeader() {
  return (
    <section className="pm-games-head-block">
      <header className="pm-games-header">
        <p className="pm-games-header__eyebrow">PlayMeet Social Hub</p>
        <h1>Oyunlar</h1>
        <p>Oyun oynayarak tanış, rekabet et ve bağ kur.</p>
        <div className="pm-games-header__live">
          <span className="pm-games-header__live-pill">
            <span className="pm-games-online-dot" />
            {gamesLiveHub.activeLabel}
          </span>
          <span className="pm-games-header__live-pill is-friends">
            <FiUsers aria-hidden />
            {gamesLiveHub.friendsLabel}
          </span>
        </div>
      </header>

      <motion.div
        className="pm-games-search"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      >
        <motion.div className="pm-games-search__field">
          <FiSearch />
          <input type="text" placeholder="Oyun ara..." aria-label="Oyun ara" />
        </motion.div>
        <button type="button" className="pm-games-search__filter" aria-label="Filtrele">
          <FiSliders />
        </button>
      </motion.div>
    </section>
  )
}
