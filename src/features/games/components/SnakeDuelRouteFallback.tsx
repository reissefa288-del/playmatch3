export function SnakeDuelRouteFallback() {
  return (
    <div className="pm-app-shell pm-app-shell--game-play pm-app-shell--snake" aria-busy="true" aria-label="Snake Duel yükleniyor">
      <div className="pm-snake-route-fallback">
        <span className="pm-snake-route-fallback__ring" />
        <p>SNAKE DUEL</p>
      </div>
    </div>
  )
}
