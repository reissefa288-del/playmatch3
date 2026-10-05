import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const errors = []
const warnings = []

function mustExist(relativePath, label) {
  const full = path.join(root, relativePath)
  if (!fs.existsSync(full)) {
    errors.push(`${label} eksik: ${relativePath}`)
    return false
  }
  return true
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'))
}

mustExist('firebase.json', 'Firebase config')
mustExist('firebase/firestore.rules', 'Firestore rules')
mustExist('firebase/storage.rules', 'Storage rules')
mustExist('firebase/firestore.indexes.json', 'Firestore indexes')
mustExist('public/manifest.webmanifest', 'PWA manifest')
mustExist('public/.well-known/assetlinks.json', 'TWA assetlinks')
mustExist('public/icons/icon-192.png', 'Icon 192')
mustExist('public/icons/icon-512.png', 'Icon 512')
mustExist('public/icons/icon-maskable-512.png', 'Maskable icon')
mustExist('.env.production.example', 'Production env template')

const firebase = readJson('firebase.json')
if (firebase.hosting?.public !== 'dist') {
  errors.push('firebase.json hosting.public "dist" olmalı')
}
if (!firebase.hosting?.rewrites?.some((r) => r.destination === '/index.html')) {
  errors.push('firebase.json SPA rewrite eksik')
}

const ignore = firebase.hosting?.ignore ?? []
if (ignore.some((pattern) => pattern.includes('**/.*'))) {
  errors.push(
    'firebase.json hosting.ignore "**/.*" TWA için .well-known/assetlinks.json dosyasını deploy dışı bırakır — kaldırılmalı',
  )
}

const manifest = readJson('public/manifest.webmanifest')
const iconSizes = new Set((manifest.icons ?? []).map((icon) => icon.sizes))
if (!iconSizes.has('192x192') || !iconSizes.has('512x512')) {
  errors.push('manifest.webmanifest 192x192 ve 512x512 ikonları içermeli')
}
if (manifest.theme_color !== '#060818' || manifest.background_color !== '#060818') {
  warnings.push('manifest theme/background #060818 dışında')
}

const assetlinks = readJson('public/.well-known/assetlinks.json')
const fingerprint = assetlinks?.[0]?.target?.sha256_cert_fingerprints?.[0] ?? ''
if (fingerprint.includes('REPLACE_WITH')) {
  warnings.push('assetlinks.json SHA-256 henüz placeholder (TWA doğrulama için sen dolduracaksın)')
}

const firebaserc = readJson('.firebaserc')
if (firebaserc.projects?.default?.includes('YOUR_FIREBASE')) {
  warnings.push('.firebaserc project id henüz placeholder (sen Firebase Console project id yazacaksın)')
}

if (errors.length > 0) {
  console.error('Firebase production doğrulama BAŞARISIZ:\n')
  for (const error of errors) console.error(' -', error)
  process.exit(1)
}

console.log('Firebase production yapılandırma doğrulaması geçti.')
for (const warning of warnings) console.warn('UYARI:', warning)
