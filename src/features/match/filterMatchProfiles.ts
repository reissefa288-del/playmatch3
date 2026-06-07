import type { MatchProfile } from './data'
import type { MatchGenderFilter } from './types'

/** Eşleşme havuzu — il sınırı yok; seçilen cinsiyete göre filtrelenir. */
export function filterMatchProfiles(
  profiles: MatchProfile[],
  gender: MatchGenderFilter,
): MatchProfile[] {
  return profiles.filter((profile) => profile.gender === gender)
}
