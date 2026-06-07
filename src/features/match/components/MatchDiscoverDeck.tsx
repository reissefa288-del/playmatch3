import { memo } from 'react'
import { motion } from 'framer-motion'
import { DAILY_LIKES_LIMIT } from '../data'
import type { MatchDiscoverActions, MatchDiscoverState } from '../matchDiscoverTypes'
import { MatchActionRow } from './MatchActionRow'
import { MatchBoostPanel } from './MatchBoostPanel'
import { MatchProfileCard } from './MatchProfileCard'
import { MatchToast } from './MatchToast'

type MatchDiscoverDeckProps = {
  state: MatchDiscoverState
  actions: MatchDiscoverActions
}

export const MatchDiscoverDeck = memo(function MatchDiscoverDeck({
  state,
  actions,
}: MatchDiscoverDeckProps) {
  if (state.poolSize === 0) {
    return (
      <motion.div
        className="pm-match-discover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          className="pm-match-discover-empty"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="pm-match-discover-empty__title">Profil bulunamadı</p>
          <p className="pm-match-discover-empty__text">
            Seçtiğin cinsiyet filtresine uygun profil yok. Filtreyi değiştirmeyi dene.
          </p>
        </motion.div>
        <MatchBoostPanel onNotify={actions.notify} />
        <MatchToast toast={state.toast} onDismiss={actions.dismissToast} />
      </motion.div>
    )
  }

  if (state.queueDone) {
    return (
      <motion.div
        className="pm-match-discover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          className="pm-match-discover-empty"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="pm-match-discover-empty__title">Keşif tamamlandı</p>
          <p className="pm-match-discover-empty__text">
            Bugünkü {state.poolSize} profili gördün. Yarın yeni oyuncular ve {DAILY_LIKES_LIMIT}{' '}
            beğeni hakkı seni bekliyor.
          </p>
        </motion.div>
        <MatchBoostPanel onNotify={actions.notify} />
        <MatchToast toast={state.toast} onDismiss={actions.dismissToast} />
      </motion.div>
    )
  }

  if (!state.current) return null

  return (
    <motion.div
      className="pm-match-discover"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <MatchProfileCard
        key={state.current.id}
        profile={state.current}
        peekLeftName={state.peekLeft?.name}
        peekRightName={state.peekRight?.name}
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
      <MatchBoostPanel onNotify={actions.notify} />
      <MatchToast toast={state.toast} onDismiss={actions.dismissToast} />
    </motion.div>
  )
})
