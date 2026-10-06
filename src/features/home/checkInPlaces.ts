import { TURKEY_PROVINCES } from './turkeyPlaces'

export type CheckInPlace = {
  id: string
  country: string
  city: string
  district: string
}

function slug(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const PLACES_BY_ID = new Map<string, CheckInPlace>()

for (const province of TURKEY_PROVINCES) {
  for (const district of province.districts) {
    const place: CheckInPlace = {
      id: `tr-${slug(province.name)}-${slug(district)}`,
      country: 'Türkiye',
      city: province.name,
      district,
    }
    PLACES_BY_ID.set(place.id, place)
  }
}

export function findProvince(name: string) {
  return TURKEY_PROVINCES.find((province) => province.name === name) ?? null
}

export function districtPlace(city: string, district: string): CheckInPlace | null {
  const place = PLACES_BY_ID.get(`tr-${slug(city)}-${slug(district)}`)
  if (!place || place.city !== city || place.district !== district) return null
  return place
}

export function findCheckInPlace(id: string | null | undefined): CheckInPlace | null {
  if (!id) return null
  return PLACES_BY_ID.get(id) ?? null
}

export function checkInPlaceLabel(place: CheckInPlace): string {
  return `${place.district}, ${place.city}`
}
