import { useLocation } from 'react-router-dom'
import '../../styles/games-hero.css'
import { GamesPopularCatalog, GamesScreenBody } from './GamesScreenBody'
import { GamesScreenShell } from './GamesScreenShell'
import { gamesShellVars } from './gamesShellTheme'

/** Sync shell + body — instant games catalog */
export function GamesTabEntry() {
  const location = useLocation()
  const isPopularCatalog = location.pathname === '/games/popular'

  if (isPopularCatalog) {
    return <GamesPopularCatalog />
  }

  return (
    <div className="pm-app-shell pm-app-shell--games" style={gamesShellVars}>
      <div className="pm-artboard">
        <main className="pm-games">
          <GamesScreenShell />
          <GamesScreenBody />
        </main>
      </div>
    </div>
  )
}

/** @deprecated use GamesTabEntry — kept for pages/tests */
export { GamesTabEntry as GamesScreen }
