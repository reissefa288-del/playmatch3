import { Navigate } from 'react-router-dom'

/** Eski lobby rotası — doğrudan oyuna yönlendir. */
export function ColorMatchLobbyScreen() {
  return <Navigate to="/games/color-match/play" replace />
}
