import type { LegalDocument } from './types'

type LegalDocumentBodyProps = {
  legalDocument: LegalDocument
  className?: string
}

export function LegalDocumentBody({ legalDocument, className = 'pm-legal-main' }: LegalDocumentBodyProps) {
  return (
    <div className={className}>
      <p className="pm-legal-updated">Son güncelleme: {legalDocument.updatedAt}</p>

      {legalDocument.sections.map((section) => (
        <section key={section.id} className="pm-legal-section" aria-labelledby={`legal-${section.id}`}>
          <h2 id={`legal-${section.id}`}>{section.title}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          {section.bullets ? (
            <ul>
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  )
}
