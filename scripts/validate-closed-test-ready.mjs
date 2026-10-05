/**
 * ADIM 2.6 — kapalı test öncesi repo + dokümantasyon kontrolü.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const errors = []
const warnings = []
const done = []

function exists(rel) {
  return fs.existsSync(path.join(root, rel))
}

function runNpm(script) {
  const result = spawnSync('npm', ['run', script], {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    stdio: 'pipe',
  })
  return { ok: result.status === 0, output: [result.stdout, result.stderr].filter(Boolean).join('\n').trim() }
}

function findAab() {
  const androidDir = path.join(root, 'android')
  if (!exists('android')) return []
  const found = []
  function walk(dir) {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.aab')) found.push(full)
    }
  }
  walk(androidDir)
  return found
}

console.log('ADIM 2.6 — Closed test preflight\n')

const docs = [
  'docs/release/ADIM_2_6_CLOSED_TEST.md',
  'docs/release/CLOSED_TEST_PLAN.md',
  'docs/release/ADIM_2_5_ANDROID_AUTH.md',
  'docs/release/testers.example.txt',
]
for (const doc of docs) {
  if (exists(doc)) done.push(doc)
  else errors.push(`Eksik: ${doc}`)
}

for (const check of ['validate:twa', 'play:preflight-console']) {
  process.stdout.write(`→ ${check}... `)
  const result = runNpm(check)
  if (result.ok) console.log('OK')
  else {
    console.log('UYARI')
    warnings.push(`${check} uyarı veya eksik — çıktıyı kontrol et`)
  }
}

const aabs = findAab()
if (aabs.length) {
  done.push(`AAB bulundu: ${path.relative(root, aabs[0])}`)
} else {
  warnings.push('android/ altında .aab yok — ADIM 2.3: npm run twa:build')
}

if (exists('android/playmeet-upload.keystore')) done.push('Upload keystore')
else warnings.push('Keystore yok — ADIM 2.2')

const assetlinks = exists('public/.well-known/assetlinks.json')
  ? fs.readFileSync(path.join(root, 'public/.well-known/assetlinks.json'), 'utf8')
  : ''
if (assetlinks.includes('REPLACE_WITH')) {
  warnings.push('assetlinks fingerprint placeholder — TWA Play Store testinde sorun çıkar')
} else if (assetlinks) {
  done.push('assetlinks fingerprint dolu')
}

if (exists('.env.production')) done.push('.env.production')
else warnings.push('.env.production yok — production deploy tamamlandı mı?')

if (done.length) {
  console.log('\nHazır:')
  for (const item of done) console.log('  ✓', item)
}

console.log()
for (const warning of warnings) console.warn('UYARI:', warning)

if (errors.length) {
  console.error('\nEksik:\n')
  for (const error of errors) console.error('  ✗', error)
  process.exit(1)
}

console.log('\nPlay Console: docs/release/ADIM_2_6_CLOSED_TEST.md')
console.log('Test planı: docs/release/CLOSED_TEST_PLAN.md')
