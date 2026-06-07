export type LegalSection = {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export type LegalDocument = {
  id: 'terms' | 'privacy'
  title: string
  subtitle: string
  updatedAt: string
  sections: LegalSection[]
}
