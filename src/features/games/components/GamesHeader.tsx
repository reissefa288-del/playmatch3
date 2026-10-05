import { FiSearch, FiSliders, FiUsers } from 'react-icons/fi'
import { gamesLiveHub } from '../data'

export function GamesHeader() {
  return (
    <section className="pm-games-head-block">
      <header className="pm-games-header">
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

      <div
        className="pm-games-search"
       
       
       
      >
        <div className="pm-games-search__field">
          <FiSearch />
          <input type="text" placeholder="Oyun ara..." aria-label="Oyun ara" />
        </div>
        <button type="button" className="pm-games-search__filter" aria-label="Filtrele">
          <FiSliders />
        </button>
      </div>
    </section>
  )
}
