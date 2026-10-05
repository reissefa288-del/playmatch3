import { logger } from 'firebase-functions/v2'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { ensureMatchOnMutualLike } from '../lib/ensureMatch'
import { likeDocId } from '../lib/ids'
import { region } from '../lib/region'
import type { FirestoreLikeDocument } from '../types/firestore'

/** ADIM 4.2 — like oluşunca karşılıklı beğeni varsa match (client create kapalı) */
export const onLikeCreated = onDocumentCreated(
  { document: 'likes/{likeId}', region },
  async (event) => {
    const likeId = event.params.likeId
    const data = event.data?.data() as FirestoreLikeDocument | undefined
    if (!data?.fromUid || !data?.toUid) {
      logger.warn('onLikeCreated: eksik like alanları', { likeId })
      return
    }

    if (likeId !== likeDocId(data.fromUid, data.toUid)) {
      logger.warn('onLikeCreated: likeId uyumsuz', { likeId, fromUid: data.fromUid, toUid: data.toUid })
      return
    }

    const created = await ensureMatchOnMutualLike(data)
    if (created) {
      logger.info('onLikeCreated: match oluşturuldu', {
        likeId,
        fromUid: data.fromUid,
        toUid: data.toUid,
      })
    }
  },
)
