/**
 * ADIM 2.2 — SHA-256 → assetlinks.json + twa-manifest.json
 *
 * npm run twa:apply-fingerprint
 * npm run twa:apply-fingerprint -- --fingerprint AA:BB:...
 */
import fs from 'node:fs'
import path from 'node:path'
import { normalizeSha256Fingerprint } from './twa-fingerprint-utils.mjs'

const root = path.resolve(import.meta.dirname, '..')
const assetlinksPath = path.join(root, 'public', '.well-known', 'assetlinks.json')
const twaPath = path.join(root, 'android', 'twa-manifest.json')
const fingerprintFile = path.join(root, 'android', 'upload-fingerprint.txt')

function arg(name) {
  const argv = process.argv.slice(2)
  const idx = argv.indexOf(name)
  return idx >= 0 && argv[idx + 1] ? argv[idx + 1] : ''
}

let raw = arg('--fingerprint')
if (!raw && fs.existsSync(fingerprintFile)) {
  raw = fs.readFileSync(fingerprintFile, 'utf8').trim()
}

if (!raw || raw.includes('REPLACE_WITH')) {
  console.error('Fingerprint gerekli.\n')
  console.error('1. Keystore oluştur + fingerprint çıkar:')
  console.error('   npm run twa:fingerprint -- --keystore android/playmeet-upload.keystore --alias playmeet')
  console.error('2. Veya android/upload-fingerprint.txt dosyasına SHA-256 yapıştır')
  console.error('3. Tekrar: npm run twa:apply-fingerprint')
  console.error('\nRehber: docs/release/ADIM_2_2_KEYSTORE.md')
  process.exit(1)
}

const fingerprint = normalizeSha256Fingerprint(raw)
if (!fingerprint) {
  console.error('Geçersiz SHA-256 formatı (64 hex veya AA:BB:... beklenir)')
  process.exit(1)
}

const assetlinks = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'app.playmeet.twa',
      sha256_cert_fingerprints: [fingerprint],
    },
  },
]

fs.writeFileSync(assetlinksPath, `${JSON.stringify(assetlinks, null, 2)}\n`, 'utf8')

const twa = JSON.parse(fs.readFileSync(twaPath, 'utf8'))
twa.fingerprints = [fingerprint]
fs.writeFileSync(twaPath, `${JSON.stringify(twa, null, 2)}\n`, 'utf8')

console.log('ADIM 2.2 — fingerprint uygulandı:')
console.log('  ✓ public/.well-known/assetlinks.json')
console.log('  ✓ android/twa-manifest.json → fingerprints')
console.log(`\n${fingerprint}`)
console.log('\nSonraki:')
console.log('  npm run validate:twa')
console.log('  npm run deploy:hosting')
console.log('  Firebase Console → Android app → SHA-1 + SHA-256 ekle')
