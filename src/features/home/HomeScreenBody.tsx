import '../../styles/home-body.css'
import { lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { AmbientParticles } from './components/AmbientParticles'
import { HomeDiscoverSection } from './components/HomeDiscoverSection'
import type { HomeFiltersController } from './useHomeFilters'
import { useHomeScrollEnd } from './useHomeScrollEnd'

const HomeFiltersSheet = lazy(() =>
  import('./components/HomeFiltersSheet').then((module) => ({ default: module.HomeFiltersSheet })),
)

type HomeScreenBodyProps = {
  filters: HomeFiltersController
}

/** Full home content — no deferred interactive gate */
export function HomeScreenBody({ filters }: HomeScreenBodyProps) {
  useHomeScrollEnd()
  const { applied, draft, open: filtersOpen, closeSheet, patchDraft, applyDraft, resetDraft } = filters

  const filtersPortal =
    typeof document !== 'undefined'
      ? createPortal(
          <Suspense fallback={null}>
            <HomeFiltersSheet
              open={filtersOpen}
              draft={draft}
              onChange={patchDraft}
              onApply={applyDraft}
              onReset={resetDraft}
              onClose={closeSheet}
            />
          </Suspense>,
          document.body,
        )
      : null

  return (
    <>
      <AmbientParticles />

      <HomeDiscoverSection filters={applied} />

      {filtersPortal}
    </>
  )
}
