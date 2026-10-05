/**
 * ADIM 12.3 — Canlı yayın öncesi son regresyon (repo + build + perf).
 *
 * Usage:
 *   npm run release:regression
 *   npm run release:regression -- --skip-build   # dist zaten güncelse
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const skipBuild = process.argv.includes('--skip-build')

function readEnv(name) {
  for (const file of ['.env.production', '.env.production.local']) {
    const p = path.join(root, file)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      if (trimmed.slice(0, idx).trim() === name) return trimmed.slice(idx + 1).trim()
    }
  }
  return ''
}

function run(label, command, args, { optional = false } = {}) {
  process.stdout.write(`→ ${label}... `)
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    stdio: 'pipe',
  })
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
  if (result.status === 0) {
    console.log('OK')
    return true
  }
  console.log(optional ? 'UYARI' : 'BAŞARISIZ')
  if (output) console.error(output)
  return optional ? true : false
}

console.log('ADIM 12.3 — Release regression preflight\n')

let failed = false
const warn = (message) => console.warn(`UYARI: ${message}`)

if (!skipBuild) {
  if (!run('Production build', 'npm', ['run', 'build:production'])) failed = true
} else if (!fs.existsSync(path.join(root, 'dist', 'index.html'))) {
  console.error('dist/ yok — --skip-build kaldır veya npm run build:production')
  process.exit(1)
} else {
  console.log('→ Production build... ATLANDI (dist mevcut)')
}

const requiredChecks = [
  ['Firebase config', 'npm', ['run', 'validate:firebase']],
  ['Firestore rules', 'npm', ['run', 'validate:firestore-rules']],
  ['Storage rules', 'npm', ['run', 'validate:storage-rules']],
  ['Cloud Functions', 'npm', ['run', 'validate:functions']],
  ['Dist artifacts', 'node', ['scripts/validate-dist-production.mjs']],
  ['Production RUM / Sentry', 'node', ['scripts/check-production-rum.mjs']],
  ['Bundle budgets', 'node', ['scripts/check-bundle-budgets.mjs']],
  ['Media budgets', 'node', ['scripts/check-media-budgets.mjs']],
  ['Image sources', 'node', ['scripts/check-image-sources.mjs']],
  ['Lighthouse regression', 'node', ['scripts/check-lighthouse-budgets.mjs']],
]

for (const [label, cmd, args] of requiredChecks) {
  if (!run(label, cmd, args)) failed = true
}

const optionalChecks = [
  ['App Check wiring', 'npm', ['run', 'validate:app-check']],
  ['TWA production', 'npm', ['run', 'validate:twa']],
  ['Play Console assets', 'npm', ['run', 'play:preflight-console']],
]

for (const [label, cmd, args] of optionalChecks) {
  run(label, cmd, args, { optional: true })
}

if (!fs.existsSync(path.join(root, 'docs/release/ADIM_12_3_SENTRY_REGRESSION.md'))) {
  warn('ADIM_12_3_SENTRY_REGRESSION.md eksik')
}

const sentryDsn = readEnv('VITE_SENTRY_DSN')
if (!sentryDsn) {
  warn('VITE_SENTRY_DSN yok — open beta için opsiyonel; production öncesi Sentry projesi ekle')
} else {
  console.log('✓ VITE_SENTRY_DSN ayarlı')
}

const vapid = readEnv('VITE_FIREBASE_VAPID_KEY')
if (!vapid) warn('VITE_FIREBASE_VAPID_KEY yok — push bildirimleri çalışmaz (ADIM 9.3)')

if (failed) {
  console.error('\nRelease regression BAŞARISIZ.')
  console.error('Rehber: docs/release/ADIM_12_3_SENTRY_REGRESSION.md')
  process.exit(1)
}

console.log('\nRelease regression geçti.')
console.log('Manuel smoke: docs/release/ADIM_1_6_SMOKE_CHECKLIST.md')
console.log('Sentry kurulum: docs/release/ADIM_12_3_SENTRY_REGRESSION.md')
console.log('Open beta (12.1) / Production (12.2): Play Console track yükseltme')
