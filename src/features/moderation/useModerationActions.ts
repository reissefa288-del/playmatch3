import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthSession } from '../auth/useAuthSession'
import { refreshMatchConnections } from '../match/matchConnectionsStore'
import { refreshBlockedPartners } from './blocksStore'
import { blockUser, submitUserReport } from './firestoreModeration'
import type { ReportSource } from './moderationTypes'

export function useModerationActions() {
  const { session } = useAuthSession()
  const navigate = useNavigate()
  const uid = session?.uid ?? null

  const reportUser = useCallback(
    async (targetUid: string, reason: string, details: string, source: ReportSource) => {
      if (!uid) return
      await submitUserReport({
        reporterUid: uid,
        targetUid,
        reason,
        details,
        source,
      })
    },
    [uid],
  )

  const blockPartner = useCallback(
    async (targetUid: string, options?: { leaveChat?: boolean }) => {
      if (!uid) return
      await blockUser(uid, targetUid)
      await refreshBlockedPartners(uid)
      await refreshMatchConnections(uid)
      if (options?.leaveChat) {
        navigate('/chat', { replace: true })
      }
    },
    [navigate, uid],
  )

  return {
    uid,
    reportUser,
    blockPartner,
  }
}
