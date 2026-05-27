import { GameDuelAmbientBg } from './GameDuelAmbientBg'
import { GameDuelVideoBg } from './GameDuelVideoBg'

/** video.mp4 + neon ambient (paylaşılan duel arka planı) */
export function GameDuelBackdrop() {
  return (
    <>
      <GameDuelVideoBg />
      <GameDuelAmbientBg video={false} />
    </>
  )
}
