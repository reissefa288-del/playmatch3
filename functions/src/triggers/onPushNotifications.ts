import { logger } from 'firebase-functions/v2'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { db } from '../lib/firebaseAdmin'
import { region } from '../lib/region'
import {
  chatUrlForPartner,
  getUserDisplayName,
  partnerUidFromMatch,
  sendPushToUser,
  truncateText,
} from '../lib/pushNotifications'
import type { FirestoreMatchDocument } from '../types/firestore'

/** ADIM 9.1 — yeni eşleşmede her iki tarafa bildirim */
export const onMatchCreatedPush = onDocumentCreated(
  { document: 'matches/{matchId}', region },
  async (event) => {
    const data = event.data?.data() as FirestoreMatchDocument | undefined
    if (!data?.userA || !data?.userB) return

    const [nameA, nameB] = await Promise.all([
      getUserDisplayName(data.userA),
      getUserDisplayName(data.userB),
    ])

    await Promise.all([
      sendPushToUser(data.userA, {
        kind: 'match',
        title: 'Yeni eşleşme!',
        body: `${nameB} ile eşleştin`,
        url: chatUrlForPartner(data.userB),
      }),
      sendPushToUser(data.userB, {
        kind: 'match',
        title: 'Yeni eşleşme!',
        body: `${nameA} ile eşleştin`,
        url: chatUrlForPartner(data.userA),
      }),
    ])

    logger.info('onMatchCreatedPush: bildirim gönderildi', {
      matchId: event.params.matchId,
      userA: data.userA,
      userB: data.userB,
    })
  },
)

type FirestoreMessageDocument = {
  senderUid: string
  text: string
  createdAt: number
}

/** ADIM 9.1 — yeni mesajda karşı tarafa bildirim */
export const onMessageCreatedPush = onDocumentCreated(
  { document: 'matches/{matchId}/messages/{messageId}', region },
  async (event) => {
    const message = event.data?.data() as FirestoreMessageDocument | undefined
    if (!message?.senderUid || !message.text) return

    const matchId = event.params.matchId
    const matchSnap = await db.collection('matches').doc(matchId).get()
    if (!matchSnap.exists) return

    const match = matchSnap.data() as FirestoreMatchDocument
    const recipientUid = partnerUidFromMatch(match, message.senderUid)
    if (!recipientUid) return

    const senderName = await getUserDisplayName(message.senderUid)
    await sendPushToUser(recipientUid, {
      kind: 'message',
      title: senderName,
      body: truncateText(message.text),
      url: chatUrlForPartner(message.senderUid),
    })
  },
)
