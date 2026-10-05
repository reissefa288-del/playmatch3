import { lazy, memo, Suspense, useState } from 'react'
import { ModerationFlow } from '../../moderation/components/ModerationFlow'
import { DAILY_LIKES_LIMIT } from '../data'
import type { MatchDiscoverActions, MatchDiscoverState } from '../matchDiscoverTypes'
import { MatchActionRow } from './MatchActionRow'
import { MatchProfileCard } from './MatchProfileCard'
import { MatchToast } from './MatchToast'

const MatchBoostPanel = lazy(() =>
  import('./MatchBoostPanel').then((module) => ({ default: module.MatchBoostPanel })),
)

type MatchDiscoverDeckProps = {
  state: MatchDiscoverState
  actions: MatchDiscoverActions
}

export const MatchDiscoverDeck = memo(function MatchDiscoverDeck({
  state,
  actions,
}: MatchDiscoverDeckProps) {
  const [moderationOpen, setModerationOpen] = useState(false)

  if (state.poolSize === 0) {
    return (
      <div
        className="pm-match-discover"
       
       
       
      >
        <div
          className="pm-match-discover-empty"
         
         
         
        >
          <p className="pm-match-discover-empty__title">Profil bulunamadı</p>
          <p className="pm-match-discover-empty__text">
            Seçtiğin cinsiyet filtresine uygun profil yok. Filtreyi değiştirmeyi dene.
          </p>
        </div>
        <Suspense fallback={null}>
          <MatchBoostPanel onNotify={actions.notify} />
        </Suspense>
        <MatchToast toast={state.toast} onDismiss={actions.dismissToast} />
      </div>
    )
  }

  if (state.queueDone) {
    return (
      <div
        className="pm-match-discover"
       
       
       
      >
        <div
          className="pm-match-discover-empty"
         
         
         
        >
          <p className="pm-match-discover-empty__title">Keşif tamamlandı</p>
          <p className="pm-match-discover-empty__text">
            Bugünkü {state.poolSize} profili gördün. Yarın yeni oyuncular ve {DAILY_LIKES_LIMIT}{' '}
            beğeni hakkı seni bekliyor.
          </p>
        </div>
        <Suspense fallback={null}>
          <MatchBoostPanel onNotify={actions.notify} />
        </Suspense>
        <MatchToast toast={state.toast} onDismiss={actions.dismissToast} />
      </div>
    )
  }

  if (!state.current) return null

  return (
    <div
      className="pm-match-discover"
     
     
     
    >
      <MatchProfileCard
        key={state.current.id}
        profile={state.current}
        peekLeftName={state.peekLeft?.name}
        peekRightName={state.peekRight?.name}
        onOpenModeration={() => setModerationOpen(true)}
      />
      <ModerationFlow
        open={moderationOpen}
        targetUid={state.current.id}
        targetName={state.current.name}
        source="profile"
        onClose={() => setModerationOpen(false)}
        onBlocked={() => actions.pass()}
      />
      <MatchActionRow
        onUndo={actions.undo}
        onPass={actions.pass}
        onLike={actions.like}
        onInvite={actions.gameInvite}
        onSuperLike={actions.superLike}
        canUndo={state.canUndo}
        canLike={state.canLike}
        canAct={state.canAct}
        likesRemaining={state.likesRemaining}
        dailyLimit={state.dailyLimit}
        isUnlimited={state.isUnlimited}
      />
      <Suspense fallback={null}>
        <MatchBoostPanel onNotify={actions.notify} />
      </Suspense>
      <MatchToast toast={state.toast} onDismiss={actions.dismissToast} />
    </div>
  )
})
