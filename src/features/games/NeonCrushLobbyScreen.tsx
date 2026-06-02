import { Navigate } from 'react-router-dom'

/** Eski lobby rotası — doğrudan oyuna yönlendir. */
export function NeonCrushLobbyScreen() {
  return <Navigate to="/games/neon-crush/play" replace />
}
