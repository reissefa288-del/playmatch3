export type ReportSource = 'profile' | 'chat'

export type FirestoreReportDocument = {
  reporterUid: string
  targetUid: string
  reason: string
  details: string
  createdAt: number
  source: ReportSource
}

export type FirestoreBlockDocument = {
  blockerUid: string
  blockedUid: string
  createdAt: number
}

export const REPORT_REASONS = [
  'Uygunsuz içerik',
  'Taciz veya tehdit',
  'Sahte profil',
  'Spam',
  'Diğer',
] as const

export type ReportReason = (typeof REPORT_REASONS)[number]
