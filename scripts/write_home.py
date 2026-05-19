from pathlib import Path

BAD_CLOSE = "</" + "motion.div>"
GOOD_CLOSE = "</" + "div>"
BAD_OPEN = "<" + "motion.div"
GOOD_OPEN = "<" + "div"

content = """import { FiChevronDown, FiMapPin, FiSliders } from 'react-icons/fi'
import homeReference from '../../reference/home-final.png'
import { AmbientParticles } from './components/AmbientParticles'
import { FilterBar } from './components/FilterBar'
import { HeroPlayerCard } from './components/HeroPlayerCard'
import { LiveSocialStrip } from './components/LiveSocialStrip'
import { Navbar } from './components/Navbar'
import { NearbyPlayerCard } from './components/NearbyPlayerCard'
import { QuestCard } from './components/QuestCard'
import { QuickStartSection } from './components/QuickStartSection'
import {
  heroGames,
  nearbyListLiveCaption,
  nearbyPlayers,
  primaryFilters,
  questMeta,
  quickStartActions,
  topCurrencies,
} from './data'

export function HomeScreen() {
  return (
    <div className="pm-app-shell">
      <motion.div className="pm-artboard">
        <AmbientParticles />
        <main className="pm-home">
          <Navbar currencies={topCurrencies} />

          <section className="pm-location">
            <motion.div className="pm-location__title-row">
              <h1>
                <FiMapPin /> Yakındaki Oyuncular
              </h1>
              <button type="button" className="pm-filter-head" aria-label="Filtrele">
                <FiSliders /> Filtrele
              </button>
            </motion.div>
            <button type="button" className="pm-location__city">
              İstanbul, Türkiye <FiChevronDown />
            </button>
          </section>

          <LiveSocialStrip />
          <FilterBar filters={primaryFilters} />

          <HeroPlayerCard favoriteGames={heroGames} portraitImage={homeReference} />

          <motion.div className="pm-carousel-dots">
            <span className="is-active" />
            <span />
            <span />
            <span />
          </motion.div>

          <section className="pm-nearby-list">
            <header>
              <motion.div className="pm-nearby-list__title-col">
                <h3>
                  <FiMapPin /> Yakınındaki Diğer Oyuncular
                </h3>
                <p className="pm-nearby-list__live">{nearbyListLiveCaption}</p>
              </motion.div>
              <button type="button">Tümünü Gör</button>
            </header>

            <motion.div className="pm-nearby-list__scroll">
              {nearbyPlayers.map((player) => (
                <NearbyPlayerCard key={player.id} player={player} portraitImage={homeReference} />
              ))}
            </motion.div>
          </section>

          <QuestCard {...questMeta} />
          <QuickStartSection actions={quickStartActions} />
        </main>
      </motion.div>
    </motion.div>
  )
}
"""

content = content.replace(BAD_CLOSE, GOOD_CLOSE).replace(BAD_OPEN, GOOD_OPEN)
Path(r"c:\Users\farec\Desktop\PlayMeet\src\features\home\HomeScreen.tsx").write_text(
    content, encoding="utf-8"
)
print("written")
