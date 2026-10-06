import '../../../styles/match-bundle.css'
import { useMemo } from 'react'
import { useUserProfile } from '../../onboarding/useUserProfile'
import { MatchDiscoverDeck } from '../../match/components/MatchDiscoverDeck'
import { useMatchDiscover } from '../../match/useMatchDiscover'
import { homeGenderToDiscoverFilter } from '../homeDiscoverGender'
import { useCheckedInPlace } from '../HomeCheckIn'
import type { HomeFilters } from '../types'

type HomeDiscoverSectionProps = {
  filters: HomeFilters
}

/** Ana sayfa keşif — Firestore profilleri (demo kuyruk yok). */
export function HomeDiscoverSection({ filters }: HomeDiscoverSectionProps) {
  const { profile } = useUserProfile()
  const discoverGender = useMemo(
    () => homeGenderToDiscoverFilter(filters.gender, profile.matchPreference),
    [filters.gender, profile.matchPreference],
  )
  const place = useCheckedInPlace()
  const { state, actions } = useMatchDiscover(discoverGender, {
    homeBots: true,
    venueId: place?.id ?? null,
  })

  return <MatchDiscoverDeck state={state} actions={actions} showCheckIn />
}
