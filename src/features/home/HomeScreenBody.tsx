import '../../styles/home-body.css'
import { HomeDiscoverSection } from './components/HomeDiscoverSection'
import { AmbientParticles } from './components/AmbientParticles'
import type { HomeFiltersController } from './useHomeFilters'
import { useHomeScrollEnd } from './useHomeScrollEnd'

type HomeScreenBodyProps = {
  filters: HomeFiltersController
}

/** Full home content — no deferred interactive gate */
export function HomeScreenBody({ filters }: HomeScreenBodyProps) {
  useHomeScrollEnd()

  return (
    <>
      <AmbientParticles />
      <HomeDiscoverSection filters={filters.applied} />
    </>
  )
}
