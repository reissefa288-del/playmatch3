/**
 * ADIM 2.4 — Play Console yükleme öncesi yerel asset kontrolü.
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const errors = []
const warnings = []
const done = []

function exists(rel) {
  return fs.existsSync(path.join(root, rel))
}

function fileSize(rel) {
  return fs.statSync(path.join(root, rel)).size
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'))
}

const docs = [
  'docs/release/ADIM_2_4_PLAY_CONSOLE.md',
  'docs/release/DATA_SAFETY.md',
  'store-assets/STORE_LISTING.tr.md',
]
for (const doc of docs) {
  if (exists(doc)) done.push(doc)
  else errors.push(`Dokümantasyon eksik: ${doc}`)
}

if (exists('store-assets/play-store-icon-512.png')) {
  const size = fileSize('store-assets/play-store-icon-512.png')
  if (size < 1024) errors.push('play-store-icon-512.png çok küçük')
  else done.push('Play Store icon 512')
} else {
  errors.push('store-assets/play-store-icon-512.png eksik')
}

if (exists('public/icons/icon-512.png')) done.push('PWA icon 512')

const featureGraphic = 'store-assets/feature-graphic.png'
if (exists(featureGraphic)) {
  done.push('Feature graphic')
} else {
  warnings.push('store-assets/feature-graphic.png yok — Play Console zorunlu (1024×500)')
}

const screenshotDir = path.join(root, 'store-assets', 'screenshots')
let phoneShots = 0
if (exists('store-assets/screenshots')) {
  phoneShots = fs
    .readdirSync(screenshotDir)
    .filter((name) => /\.(png|jpe?g|webp)$/i.test(name)).length
}
if (phoneShots >= 2) done.push(`${phoneShots} telefon screenshot`)
else warnings.push(`Telefon screenshot ${phoneShots}/2 — store-assets/screenshots/ ekle`)

let host = 'playmeet.app'
try {
  host = readJson('android/twa-host.json').host ?? host
} catch {
  warnings.push('android/twa-host.json okunamadı')
}

done.push(`Privacy URL şablonu: https://${host}/legal/gizlilik-politikasi`)

const listing = exists('store-assets/STORE_LISTING.tr.md')
  ? fs.readFileSync(path.join(root, 'store-assets/STORE_LISTING.tr.md'), 'utf8')
  : ''
if (listing.includes('Kısa açıklama') && listing.includes('Tam açıklama')) {
  done.push('Store listing metinleri (TR)')
} else if (listing) {
  warnings.push('STORE_LISTING.tr.md eksik bölüm içerebilir')
}

console.log('ADIM 2.4 — Play Console preflight\n')

if (done.length) {
  console.log('Hazır:')
  for (const item of done) console.log('  ✓', item)
  console.log()
}

for (const warning of warnings) console.warn('UYARI:', warning)

if (errors.length) {
  console.error('\nEksik:\n')
  for (const error of errors) console.error('  ✗', error)
  process.exit(1)
}

console.log('\nPlay Console adımları: docs/release/ADIM_2_4_PLAY_CONSOLE.md')
if (warnings.length) console.log('Grafik/screenshot uyarılarını gider → Play Console listing yükle.')
