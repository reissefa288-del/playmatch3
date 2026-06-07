import { motion } from 'framer-motion'
import { DAILY_LIKES_LIMIT } from '../data'
import type { useMatchDiscover } from '../useMatchDiscover'
import { MatchActionRow } from './MatchActionRow'
import { MatchBoostPanel } from './MatchBoostPanel'
import { MatchProfileCard } from './MatchProfileCard'
import { MatchToast } from './MatchToast'

type DiscoverState = ReturnType<typeof useMatchDiscover>

type MatchDiscoverDeckProps = {
  discover: DiscoverState
}

export function MatchDiscoverDeck({ discover }: MatchDiscoverDeckProps) {
  if (discover.poolSize === 0) {
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
        <MatchBoostPanel onNotify={discover.notify} />
        <MatchToast toast={discover.toast} onDismiss={discover.dismissToast} />
      </motion.div>
    )
  }

  if (discover.queueDone) {
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
            Bugünkü {discover.poolSize} profili gördün. Yarın yeni oyuncular ve {DAILY_LIKES_LIMIT}{' '}
            beğeni hakkı seni bekliyor.
          </p>
        </motion.div>
        <MatchBoostPanel onNotify={discover.notify} />
        <MatchToast toast={discover.toast} onDismiss={discover.dismissToast} />
      </motion.div>
    )
  }

  if (!discover.current) return null

  return (
    <motion.div
      className="pm-match-discover"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <MatchProfileCard
        key={discover.current.id}
        profile={discover.current}
        peekLeftName={discover.peekLeft?.name}
        peekRightName={discover.peekRight?.name}
      />
      <MatchActionRow
        onUndo={discover.undo}
        onPass={discover.pass}
        onLike={discover.like}
        onInvite={discover.gameInvite}
        onSuperLike={discover.superLike}
        canUndo={discover.canUndo}
        canLike={discover.canLike}
        canAct={discover.canAct}
        likesRemaining={discover.likesRemaining}
        dailyLimit={discover.dailyLimit}
        isUnlimited={discover.isUnlimited}
      />
      <MatchBoostPanel onNotify={discover.notify} />
      <MatchToast toast={discover.toast} onDismiss={discover.dismissToast} />
    </motion.div>
  )
}
