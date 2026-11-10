import { lazy, memo, Suspense, useCallback, useRef, useState, useSyncExternalStore } from 'react'
import { ModerationFlow } from '../../moderation/components/ModerationFlow'
import { DAILY_LIKES_LIMIT } from '../data'
import type { MatchDiscoverActions, MatchDiscoverState } from '../matchDiscoverTypes'
import { CrossedToday } from '../CrossedScreen'
import { MatchActionRow } from './MatchActionRow'
import { MatchProfileCard, type MatchProfileCardHandle } from './MatchProfileCard'
import { MatchSuperLikeOverlay } from './MatchSuperLikeOverlay'
import { MatchToast } from './MatchToast'
import { CheckInFeed } from '../../home/CheckInFeed'
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
  const [superLikeOpen, setSuperLikeOpen] = useState(false)
  const cardRef = useRef<MatchProfileCardHandle>(null)
  const checkedIn = useCheckedInPlace()
  const presence = useSyncExternalStore(
    subscribeVenuePresence,
    getVenuePresenceSnapshot,
    getVenuePresenceServerSnapshot,
  )

  const handlePass = useCallback(() => {
    cardRef.current?.triggerPass()
  }, [])

  const handleLike = useCallback(() => {
    cardRef.current?.triggerLike()
  }, [])

  const handleSuperLikeOpen = useCallback(() => {
    if (!state.canAct) return
    setSuperLikeOpen(true)
  }, [state.canAct])

  const handleSuperLikeConfirm = useCallback(() => {
    setSuperLikeOpen(false)
    window.setTimeout(() => {
      cardRef.current?.triggerSuperLike()
    }, 40)
  }, [])

  if (showCheckIn && checkedIn) {
    const here = presence.ready && presence.placeId === checkedIn.id ? presence.people : []
    return (
      <div className="pm-match-discover">
        <HomeCheckIn />
        <div className="pm-checkin-stage">
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
          <div className="pm-match-promo-stack">
            {showCheckIn ? null : <CrossedToday />}
            <Suspense fallback={null}>
              <MatchBoostPanel onNotify={actions.notify} />
            </Suspense>
          </div>
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
        <div className="pm-match-promo-stack">
          {showCheckIn ? null : <CrossedToday />}
          <Suspense fallback={null}>
            <MatchBoostPanel onNotify={actions.notify} />
          </Suspense>
        </div>
        <MatchToast toast={state.toast} onDismiss={actions.dismissToast} />
      </div>
    )
  }

  if (!state.current) return null

  return (
    <div className="pm-match-discover">
      <MatchProfileCard
        key={state.current.id}
        ref={cardRef}
        profile={state.current}
        nextProfile={state.peekRight}
        onOpenModeration={() => setModerationOpen(true)}
        onPass={actions.pass}
        onLike={actions.like}
        onSuperLike={actions.superLike}
        canLike={state.canLike}
        canAct={state.canAct}
        footer={
          <MatchActionRow
            onUndo={actions.undo}
            onPass={handlePass}
            onLike={handleLike}
            onInvite={actions.gameInvite}
            onSuperLike={handleSuperLikeOpen}
            canUndo={state.canUndo}
            canLike={state.canLike}
            canAct={state.canAct}
            likesRemaining={state.likesRemaining}
            dailyLimit={state.dailyLimit}
          />
        }
      />
      <ModerationFlow
        open={moderationOpen}
        targetUid={state.current.id}
        targetName={state.current.name}
        source="profile"
        onClose={() => setModerationOpen(false)}
        onBlocked={() => actions.pass()}
      />
      <div className="pm-match-promo-stack">
        {showCheckIn ? <HomeCheckIn /> : <CrossedToday />}
        <Suspense fallback={null}>
          <MatchBoostPanel onNotify={actions.notify} />
        </Suspense>
      </div>
      <MatchSuperLikeOverlay
        open={superLikeOpen}
        profile={state.current}
        onClose={() => setSuperLikeOpen(false)}
        onConfirm={handleSuperLikeConfirm}
      />
      <MatchToast toast={state.toast} onDismiss={actions.dismissToast} />
    </div>
  )
})
