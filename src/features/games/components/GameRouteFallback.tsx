/** Minimal loading shell for lazy-loaded game routes — reuses existing snake fallback styles. */
export function GameRouteFallback() {
  return (
    <div className="pm-app-shell pm-app-shell--game-play" aria-busy="true" aria-label="Oyun yükleniyor">
      <div className="pm-snake-route-fallback">
        <span className="pm-snake-route-fallback__ring" />
      </div>
    </div>
  )
}
