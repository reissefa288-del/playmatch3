import { useState } from 'react'
import type { ReportSource } from '../moderationTypes'
import { useModerationActions } from '../useModerationActions'
import { DeleteAccountSheet } from './DeleteAccountSheet'
import { ModerationMenuSheet } from './ModerationMenuSheet'
import { ReportSheet } from './ReportSheet'

type ModerationFlowProps = {
  open: boolean
  targetUid: string
  targetName: string
  source: ReportSource
  leaveChatOnBlock?: boolean
  onClose: () => void
  onBlocked?: () => void
}

export function ModerationFlow({
  open,
  targetUid,
  targetName,
  source,
  leaveChatOnBlock = false,
  onClose,
  onBlocked,
}: ModerationFlowProps) {
  const { reportUser, blockPartner } = useModerationActions()
  const [reportOpen, setReportOpen] = useState(false)
  const [blocking, setBlocking] = useState(false)

  function closeAll() {
    setReportOpen(false)
    onClose()
  }

  async function handleBlock() {
    setBlocking(true)
    try {
      await blockPartner(targetUid, { leaveChat: leaveChatOnBlock })
      onBlocked?.()
      closeAll()
    } finally {
      setBlocking(false)
    }
  }

  return (
    <>
      <ModerationMenuSheet
        open={open && !reportOpen}
        targetName={targetName}
        onClose={closeAll}
        onReport={() => setReportOpen(true)}
        onBlock={() => void handleBlock()}
        blocking={blocking}
      />
      <ReportSheet
        open={open && reportOpen}
        targetName={targetName}
        source={source}
        onClose={closeAll}
        onSubmit={async (reason, details) => {
          await reportUser(targetUid, reason, details, source)
        }}
      />
    </>
  )
}

type DeleteAccountFlowProps = {
  open: boolean
  onClose: () => void
  onDeleted: () => void
}

export function DeleteAccountFlow({ open, onClose, onDeleted }: DeleteAccountFlowProps) {
  const { uid } = useModerationActions()

  return (
    <DeleteAccountSheet
      open={open}
      onClose={onClose}
      onConfirm={async () => {
        if (!uid) return
        const { deletePlayMeetAccount } = await import('../deleteAccount')
        await deletePlayMeetAccount(uid)
        onDeleted()
      }}
    />
  )
}
