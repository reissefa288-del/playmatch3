import { privacyPolicy } from '../legal/content/privacyPolicy'
import { termsOfService } from '../legal/content/termsOfService'
import { patchFirestoreUserProfile } from '../profile/firestoreUserProfile'
import type { FirestoreUserDocument, LegalConsentRecord } from '../profile/types'

export type { LegalConsentRecord }

export const LEGAL_VERSIONS = {
  terms: termsOfService.updatedAt,
  privacy: privacyPolicy.updatedAt,
} as const

/** ADIM 11.2 — yasal onay Firestore kaydı */
export async function persistLegalConsent(uid: string): Promise<void> {
  const legalConsent: LegalConsentRecord = {
    termsVersion: LEGAL_VERSIONS.terms,
    privacyVersion: LEGAL_VERSIONS.privacy,
    acceptedAt: Date.now(),
  }
  await patchFirestoreUserProfile(uid, { legalConsent })
}

export function hasValidLegalConsent(doc: FirestoreUserDocument | null | undefined): boolean {
  if (!doc?.legalConsent) return false
  return (
    doc.legalConsent.termsVersion === LEGAL_VERSIONS.terms &&
    doc.legalConsent.privacyVersion === LEGAL_VERSIONS.privacy
  )
}
