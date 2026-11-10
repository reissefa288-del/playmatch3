/**
 * ADIM 2.2 — SHA-256 → assetlinks.json + twa-manifest.json
 *
 * npm run twa:apply-fingerprint
 * npm run twa:apply-fingerprint -- --fingerprint AA:BB:...
 * npm run twa:apply-fingerprint -- --add AA:BB:...   (mevcut listeye ekle — Play App Signing)
 */
import fs from 'node:fs'
import path from 'node:path'
import { normalizeSha256Fingerprint } from './twa-fingerprint-utils.mjs'

const root = path.resolve(import.meta.dirname, '..')
const assetlinksPath = path.join(root, 'public', '.well-known', 'assetlinks.json')
const twaPath = path.join(root, 'android', 'twa-manifest.json')
const fingerprintFile = path.join(root, 'android', 'upload-fingerprint.txt')
const playSigningFile = path.join(root, 'android', 'play-signing-fingerprint.txt')

function arg(name) {
  const argv = process.argv.slice(2)
  const idx = argv.indexOf(name)
  return idx >= 0 && argv[idx + 1] ? argv[idx + 1] : ''
}

function readExistingFingerprints() {
  try {
    const assetlinks = JSON.parse(fs.readFileSync(assetlinksPath, 'utf8'))
    const list = assetlinks?.[0]?.target?.sha256_cert_fingerprints
    return Array.isArray(list) ? list.map(String) : []
  } catch {
    return []
  }
}

const addMode = Boolean(arg('--add'))
let raw = arg('--add') || arg('--fingerprint')
if (!raw && fs.existsSync(playSigningFile) && addMode === false) {
  const playRaw = fs.readFileSync(playSigningFile, 'utf8').trim()
  if (playRaw && !playRaw.includes('REPLACE_WITH')) {
    raw = playRaw
  }
}
if (!raw && fs.existsSync(fingerprintFile)) {
  raw = fs.readFileSync(fingerprintFile, 'utf8').trim()
}

if (!raw || raw.includes('REPLACE_WITH')) {
  console.error('Fingerprint gerekli.\n')
  console.error('1. Upload keystore fingerprint:')
  console.error('   npm run twa:fingerprint -- --keystore android/playmeet-upload.keystore --alias playmeet')
  console.error('2. Play App Signing SHA-256 eklemek için:')
  console.error('   android/play-signing-fingerprint.txt içine yapıştır, sonra:')
  console.error('   npm run twa:apply-fingerprint -- --add "$(cat android/play-signing-fingerprint.txt)"')
  console.error('   veya: npm run twa:apply-fingerprint -- --add AA:BB:...')
  console.error('3. Play Console → Setup → App signing → SHA-256 certificate fingerprint')
  process.exit(1)
}

const fingerprint = normalizeSha256Fingerprint(raw)
if (!fingerprint) {
  console.error('Geçersiz SHA-256 formatı (64 hex veya AA:BB:... beklenir)')
  process.exit(1)
}

const existing = readExistingFingerprints()
const fingerprints = addMode
  ? [...new Set([...existing, fingerprint])]
  : [fingerprint]

// Play signing dosyası varsa ve replace modunda upload ile birleştir
if (!addMode && fs.existsSync(playSigningFile)) {
  const playRaw = fs.readFileSync(playSigningFile, 'utf8').trim()
  const playFp = normalizeSha256Fingerprint(playRaw)
  if (playFp && playFp !== fingerprint) {
    fingerprints.push(playFp)
  }
}

const unique = [...new Set(fingerprints)]

const assetlinks = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'app.playmeet.twa',
      sha256_cert_fingerprints: unique,
    },
  },
]

fs.writeFileSync(assetlinksPath, `${JSON.stringify(assetlinks, null, 2)}\n`, 'utf8')

const twa = JSON.parse(fs.readFileSync(twaPath, 'utf8'))
twa.fingerprints = unique
fs.writeFileSync(twaPath, `${JSON.stringify(twa, null, 2)}\n`, 'utf8')

console.log('ADIM 2.2 — fingerprint uygulandı:')
console.log('  ✓ public/.well-known/assetlinks.json')
console.log('  ✓ android/twa-manifest.json → fingerprints')
for (const fp of unique) {
  console.log(`\n${fp}`)
}
console.log('\nSonraki:')
console.log('  npm run validate:twa')
console.log('  npm run deploy:hosting')
console.log('  Firebase Console → Android app → SHA-1 + SHA-256 ekle')
