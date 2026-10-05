/**
 * ADIM 3.5 — storage.rules statik doğrulama (deploy öncesi).
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const rulesPath = path.join(root, 'firebase', 'storage.rules')
const examplePath = path.join(root, 'firebase', 'storage.rules.example')
const errors = []

if (!fs.existsSync(rulesPath)) {
  console.error('firebase/storage.rules eksik')
  process.exit(1)
}

const rules = fs.readFileSync(rulesPath, 'utf8')

const required = [
  ['ADIM 3.6 hasAppCheck helper', /function hasAppCheck\(\)/],
  ['isSignedIn requires App Check', /function isSignedIn\(\)[\s\S]*hasAppCheck\(\)/],
  ['ADIM 3.5 scoped photos read', /allow read:.*isOwner\(userId\)/s],
  ['isDiscoverableUser helper', /function isDiscoverableUser/],
  ['isMatchPartner helper', /function isMatchPartner/],
  ['firestore cross-service get', /firestore\.get\(\/databases\/\(default\)\/documents\/users/],
  ['firestore cross-service match exists', /firestore\.exists\(\/databases\/\(default\)\/documents\/matches/],
  ['owner-only write', /allow write:.*isOwner\(userId\)/s],
  ['5MB image limit', /request\.resource\.size < 5 \* 1024 \* 1024/],
]

for (const [label, pattern] of required) {
  if (!pattern.test(rules)) errors.push(`Eksik/hatalı: ${label}`)
}

const photosBlock = rules.match(/match \/users\/\{userId\}\/photos\/\{fileName\}[\s\S]*?(?=\n    \}|\n  \})/)?.[0] ?? ''
if (/allow read: if request\.auth != null;/.test(photosBlock)) {
  errors.push('photos allow read: if request.auth != null — scoped read kullan (ADIM 3.5)')
}

if (fs.existsSync(examplePath)) {
  const example = fs.readFileSync(examplePath, 'utf8')
  if (example !== rules) {
    errors.push('storage.rules.example senkron değil — example dosyasını güncelle')
  }
}

if (errors.length) {
  console.error('Storage rules doğrulama BAŞARISIZ:\n')
  for (const error of errors) console.error(' -', error)
  process.exit(1)
}

console.log('Storage rules doğrulaması geçti (3.5 photos scoped + 3.6 App Check).')
console.log('Deploy: npm run deploy:security')
