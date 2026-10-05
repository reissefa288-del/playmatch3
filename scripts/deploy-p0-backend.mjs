/**
 * P0 — Canlı backend tek komut deploy (1.5 + 4.5 + 3.4 rules/indexes).
 *
 * Ön koşul:
 *   1. Firebase Console (1.3) + firebase/firebase-web-config.json → npm run firebase:init-env
 *   2. .env.production içinde App Check site key (VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY)
 *   3. npx firebase login
 *   4. Blaze plan (Functions için)
 *
 * Usage:
 *   npm run deploy:p0-backend
 *   npm run deploy:p0-backend -- --hosting-only   # rules/functions atlandı
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const hostingOnly = process.argv.includes('--hosting-only')

function run(label, command, args, { optional = false } = {}) {
  process.stdout.write(`\n→ ${label}... `)
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
  console.log(optional ? 'ATLANDI (uyarı)' : 'BAŞARISIZ')
  if (output) console.error(output)
  return optional
}

function firebaseBin() {
  return path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'firebase.cmd' : 'firebase')
}

function readProjectId() {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, '.firebaserc'), 'utf8')).projects?.default ?? ''
  } catch {
    return ''
  }
}

console.log('P0 — Canlı backend deploy\n')
console.log('Rehber: docs/release/ADIM_P0_BACKEND.md\n')

if (!fs.existsSync(path.join(root, 'firebase', 'firebase-web-config.json'))) {
  const example = path.join(root, 'firebase', 'firebase-web-config.example.json')
  const target = path.join(root, 'firebase', 'firebase-web-config.json')
  if (fs.existsSync(example)) {
    fs.copyFileSync(example, target)
    console.log('Oluşturuldu: firebase/firebase-web-config.json')
    console.log('Firebase Console → Web app config JSON yapıştır → npm run firebase:init-env\n')
  }
}

let failed = false

if (!run('Firebase kurulum (1.4)', 'npm', ['run', 'firebase:verify-setup'])) failed = true
if (!run('Production env', 'npm', ['run', 'env:check:production'])) failed = true

const bin = firebaseBin()
if (!fs.existsSync(bin)) {
  console.error('\nfirebase-tools yok — npm install')
  process.exit(1)
}

process.stdout.write('\n→ Firebase CLI oturumu... ')
const login = spawnSync(bin, ['login:list'], { cwd: root, encoding: 'utf8', timeout: 20_000 })
const loginOut = `${login.stdout ?? ''}${login.stderr ?? ''}`.trim()
if (login.status !== 0 || /No authorized accounts|not logged in/i.test(loginOut)) {
  console.log('YOK')
  console.error('\nTarayıcıda giriş yap:')
  console.error('  npx firebase login')
  failed = true
} else {
  console.log('OK')
}

const projectId = readProjectId()
if (projectId && !projectId.includes('YOUR_FIREBASE')) {
  process.stdout.write(`→ firebase use ${projectId}... `)
  const use = spawnSync(bin, ['use', projectId], { cwd: root, encoding: 'utf8', timeout: 15_000 })
  console.log(use.status === 0 ? 'OK' : 'ERİŞİLEMİYOR')
  if (use.status !== 0) failed = true
}

if (failed) {
  console.error('\n── P0 durdu (Console / env / login eksik) ──')
  console.error('1. docs/release/FIREBASE_CONSOLE_SETUP.md — proje oluştur')
  console.error('2. firebase/firebase-web-config.json doldur → npm run firebase:init-env')
  console.error('3. reCAPTCHA v3 + App Check → VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY (.env.production)')
  console.error('4. npx firebase login')
  console.error('5. Console → Blaze plan (Functions)')
  console.error('6. npm run deploy:p0-backend')
  process.exit(1)
}

if (!run('Security preflight (3.4)', 'npm', ['run', 'security:preflight'])) failed = true
if (!run('Functions preflight (4.5)', 'npm', ['run', 'functions:preflight'])) failed = true

if (failed) {
  console.error('\nPreflight başarısız — ADIM_P0_BACKEND.md')
  process.exit(1)
}

console.log('\n── Deploy başlıyor ──')
console.log('Not: Functions için Blaze plan şart. İlk deploy 3–8 dk sürebilir.\n')

if (!run('Production build + Hosting + Rules + Indexes (1.5)', 'npm', ['run', 'build:production'])) {
  process.exit(1)
}

if (
  !run(
    'Firebase deploy (hosting, rules, indexes)',
    bin,
    ['deploy', '--only', 'hosting,firestore:rules,firestore:indexes,storage'],
  )
) {
  process.exit(1)
}

if (!hostingOnly) {
  if (!run('Cloud Functions (4.5)', bin, ['deploy', '--only', 'functions'])) {
    console.error('\nFunctions deploy başarısız — Blaze plan aktif mi?')
    console.error('Console → Project settings → Usage and billing → Upgrade')
    process.exit(1)
  }
}

run('Post-deploy smoke', 'npm', ['run', 'post-deploy:smoke'], { optional: true })

console.log('\n── P0 backend deploy tamamlandı ──\n')
if (projectId) {
  console.log(`Hosting: https://${projectId}.web.app`)
  console.log(`Health:  https://europe-west1-${projectId}.cloudfunctions.net/health`)
}
console.log('\nHemen yap:')
console.log('  • Console → Auth → Authorized domains → .web.app ekle')
console.log('  • Console → App Check → Monitoring (1–2 gün) → sonra Enforce (3.7)')
console.log('  • Manuel smoke: docs/release/ADIM_1_6_SMOKE_CHECKLIST.md')
console.log('  • 2 hesap güvenlik: docs/release/SECURITY_TEST_CHECKLIST.md')
