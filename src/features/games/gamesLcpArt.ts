import oyunArtThumb from '../../reference/opt/thumb/oyun.webp'
import oyunArtThumbAvif from '../../reference/opt/thumb/oyun.avif'

/** P6 — tiny LCP payload for GamesScreenShell (avoids gameArtImages → full art graph) */
export const gamesLcpArt = {
  webp: oyunArtThumb,
  avif: oyunArtThumbAvif,
} as const
