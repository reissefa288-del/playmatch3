import { LegalDocumentScreen } from './LegalDocumentScreen'
import { privacyPolicy } from './content/privacyPolicy'
import { termsOfService } from './content/termsOfService'

export function TermsOfServiceScreen() {
  return <LegalDocumentScreen legalDocument={termsOfService} />
}

export function PrivacyPolicyScreen() {
  return <LegalDocumentScreen legalDocument={privacyPolicy} />
}
