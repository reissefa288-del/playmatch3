import { FiArrowLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { LegalDocumentBody } from './LegalDocumentBody'
import type { LegalDocument } from './types'

type LegalDocumentScreenProps = {
  legalDocument: LegalDocument
}

export function LegalDocumentScreen({ legalDocument }: LegalDocumentScreenProps) {
  const navigate = useNavigate()

  return (
    <div className="pm-legal-shell">
      <header className="pm-legal-header">
        <button
          type="button"
          className="pm-legal-header__back"
          aria-label="Geri dön"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft aria-hidden />
        </button>
        <div className="pm-legal-header__text">
          <h1>{legalDocument.title}</h1>
          <p>{legalDocument.subtitle}</p>
        </div>
      </header>

      <LegalDocumentBody legalDocument={legalDocument} />
    </div>
  )
}
