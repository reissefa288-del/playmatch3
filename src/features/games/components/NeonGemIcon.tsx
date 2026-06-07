import type { GemId } from '../utils/neonCrushEngine'
import { GEM_IDS } from '../utils/neonCrushEngine'
import gemA1 from '../../../reference/opt/thumb/a1.webp'
import gemA2 from '../../../reference/opt/thumb/a2.webp'
import gemA3 from '../../../reference/opt/thumb/a3.webp'
import gemA4 from '../../../reference/opt/thumb/a4.webp'
import gemA5 from '../../../reference/opt/thumb/a5.webp'

export const GEM_ART: Record<GemId, string> = {
  a1: gemA1,
  a2: gemA2,
  a3: gemA3,
  a4: gemA4,
  a5: gemA5,
}

const LEGACY_GEM_MAP: Record<string, GemId> = {
  star: 'a1',
  moon: 'a2',
  diamond: 'a3',
  club: 'a4',
  flame: 'a5',
  heart: 'a1',
}

export function normalizeGemId(gem: string): GemId {
  if (GEM_IDS.includes(gem as GemId)) return gem as GemId
  return LEGACY_GEM_MAP[gem] ?? 'a1'
}

export function getGemArtUrl(gem: string): string {
  return GEM_ART[normalizeGemId(gem)]
}
