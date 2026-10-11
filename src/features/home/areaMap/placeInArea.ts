import type { MatchProfile } from '../../match/data'

export type AreaPerson = {
  id: string
  name: string
  age: number
  photo: string
  objectPosition: string
  online: boolean
  bio: string
  km: number
  profile: MatchProfile
}

export type AreaSpot = AreaPerson & {
  x: number
  y: number
  /** Saat yönünde, tepeden derece. Sokak yönü değildir. */
  bearing: number
  label: string
}

/** Mesafe metnini kaba bir kilometre kovasına indirger. Metre hassasiyeti tutulmaz. */
export function coarseKm(distance: string): number {
  const text = distance.trim().toLocaleLowerCase('tr-TR')
  if (!text || text === 'burada' || text === 'yakın') return 0.6
  if (text.includes('km')) {
    const km = text.match(/(\d+(?:[.,]\d+)?)/)
    return km ? Number(km[1]!.replace(',', '.')) : 1
  }
  const meters = text.match(/(\d+(?:[.,]\d+)?)\s*m\b/)
  if (meters) {
    const value = Number(meters[1]!.replace(',', '.'))
    if (value < 500) return 0.4
    if (value < 1000) return 0.8
    return 1.2
  }
  const bare = text.match(/(\d+(?:[.,]\d+)?)/)
  return bare ? Number(bare[1]!.replace(',', '.')) : 1.2
}

export function bandLabel(km: number): string {
  if (km < 0.8) return 'yakın çevrede'
  if (km < 1.6) return 'yaklaşık 1 km'
  if (km < 3.5) return 'yaklaşık 2 km'
  if (km < 7) return 'yaklaşık 5 km'
  return 'yaklaşık 10 km'
}

function hash01(id: string, salt: number) {
  let h = (salt + 2166136261) >>> 0
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967296
}

/**
 * Kişiyi gerçek kerterizine değil, kimliğinden türeyen bir halkaya koyar.
 * x/y yüzde cinsindendir ve bir sokak koordinatı değildir.
 */
export function layoutArea(people: AreaPerson[], radiusKm: number): AreaSpot[] {
  const visible = people.filter((person) => person.km <= radiusKm)
  const ranked = [...visible].sort((a, b) => hash01(a.id, 9) - hash01(b.id, 9))
  const count = ranked.length
  return ranked.map((person, index) => {
    const spread = count <= 1 ? 0 : index / count
    const angle = (hash01(person.id, 4) * 0.55 + spread) * Math.PI * 2
    const depth = Math.min(1, person.km / radiusKm)
    const ring = Math.min(0.9, Math.max(0.46, 0.46 + depth * 0.44 + (hash01(person.id, 2) - 0.5) * 0.05))
    const bearing = (((angle * 180) / Math.PI + 90) % 360 + 360) % 360
    return {
      ...person,
      x: 50 + Math.cos(angle) * ring * 44,
      y: 50 + Math.sin(angle) * ring * 42,
      bearing,
      label: bandLabel(person.km),
    }
  })
}
