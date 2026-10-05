import { GameDuelAmbientBg } from './GameDuelAmbientBg'
import { GameDuelVideoBg } from './GameDuelVideoBg'

/** Tüm duel oyunları — paylaşılan video.mp4 arka planı + ambient (CSS ile gizlenir) */
export function GameDuelBackdrop() {
  return (
    <>
      <GameDuelVideoBg />
      <GameDuelAmbientBg />
    </>
  )
}
