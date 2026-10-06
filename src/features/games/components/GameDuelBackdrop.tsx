import { GameDuelAmbientBg, type GameDuelTheme } from './GameDuelAmbientBg'

type GameDuelBackdropProps = {
  theme?: GameDuelTheme
}

/** Tüm duel oyunları — ortak gökyüzü arka planı */
export function GameDuelBackdrop({ theme = 'default' }: GameDuelBackdropProps) {
  return <GameDuelAmbientBg theme={theme} />
}
