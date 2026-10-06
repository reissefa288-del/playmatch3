import { lazy, memo, Suspense, useState, useSyncExternalStore } from 'react'
import { ModerationFlow } from '../../moderation/components/ModerationFlow'
import { DAILY_LIKES_LIMIT } from '../data'
import type { MatchDiscoverActions, MatchDiscoverState } from '../matchDiscoverTypes'
import { MatchActionRow } from './MatchActionRow'
import { MatchProfileCard } from './MatchProfileCard'
import { MatchToast } from './MatchToast'
import { CheckInFeed } from '../../home/CheckInFeed'
import { CheckInShader } from '../../home/CheckInShader'
import { HomeCheckIn, useCheckedInPlace } from '../../home/HomeCheckIn'
import {
  getVenuePresenceServerSnapshot,
  getVenuePresenceSnapshot,
  subscribeVenuePresence,
} from '../../home/checkInPresence'
import { getCheckInCheckedInAt } from '../../home/checkInStore'

const MatchBoostPanel = lazy(() =>
  import('./MatchBoostPanel').then((module) => ({ default: module.MatchBoostPanel })),
)

type MatchDiscoverDeckProps = {
  state: MatchDiscoverState
  actions: MatchDiscoverActions
  showCheckIn?: boolean
}

export const MatchDiscoverDeck = memo(function MatchDiscoverDeck({
  state,
  actions,
  showCheckIn = false,
}: MatchDiscoverDeckProps) {
  const [moderationOpen, setModerationOpen] = useState(false)
  const checkedIn = useCheckedInPlace()
  const presence = useSyncExternalStore(
    subscribeVenuePresence,
    getVenuePresenceSnapshot,
    getVenuePresenceServerSnapshot,
  )

  if (showCheckIn && checkedIn) {
    const here = presence.ready && presence.placeId === checkedIn.id ? presence.people : []
    return (
      <div className="pm-match-discover">
        <HomeCheckIn />
        <div className="pm-checkin-stage">
          <CheckInShader />
          <CheckInFeed people={here} youAt={getCheckInCheckedInAt()} />
        </div>
        <MatchToast toast={state.toast} onDismiss={actions.dismissToast} />
      </div>
    )
  }

  if (state.poolSize === 0) {
    const atPlace = showCheckIn && checkedIn
    if (atPlace && state.poolLoading) {
      return (
        <div className="pm-match-discover">
          <HomeCheckIn />
        </div>
      )
    }
    return (
      <div className="pm-match-discover">
        {showCheckIn ? <HomeCheckIn /> : null}
        <div className="pm-match-discover-empty">
          <p className="pm-match-discover-empty__title">
            {atPlace ? 'Henüz burada kimse yok' : 'Profil bulunamadı'}
          </p>
          <p className="pm-match-discover-empty__text">
            {atPlace
              ? 'Şu an bu ilçede başka kimse yok. Check-in’in 3 saat açık kalır; biri gelince burada belirir.'
              : 'Seçtiğin cinsiyet filtresine uygun profil yok. Filtreyi değiştirmeyi dene.'}
          </p>
        </div>
        {atPlace ? null : (
          <Suspense fallback={null}>
            <MatchBoostPanel onNotify={actions.notify} />
          </Suspense>
        )}
        <MatchToast toast={state.toast} onDismiss={actions.dismissToast} />
      </div>
    )
  }

  if (state.queueDone) {
    if (showCheckIn && checkedIn) {
      return (
        <div className="pm-match-discover">
          <HomeCheckIn />
          <div className="pm-match-discover-empty">
            <p className="pm-match-discover-empty__title">Buradakileri gördün</p>
            <p className="pm-match-discover-empty__text">
              Yeni biri check-in yapınca burada belirir. Check-in’in 3 saat açık kalır.
            </p>
          </div>
        </div>
      )
    }
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
      {showCheckIn ? <HomeCheckIn /> : null}
      <Suspense fallback={null}>
        <MatchBoostPanel onNotify={actions.notify} />
      </Suspense>
      <MatchToast toast={state.toast} onDismiss={actions.dismissToast} />
    </div>
  )
})
