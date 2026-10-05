/**
 * ADIM 3.7 — App Check enforce + rules deploy öncesi kontroller.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
let blocked = false
const warnings = []
const manual = []

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

function runNpm(script) {
  const result = spawnSync('npm', ['run', script], {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    stdio: 'pipe',
  })
  return { ok: result.status === 0, output: [result.stdout, result.stderr].filter(Boolean).join('\n').trim() }
}

function firebaseBin() {
  return path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'firebase.cmd' : 'firebase')
}

console.log('ADIM 3.7 — App Check enforce + deploy preflight\n')

if (!fs.existsSync(path.join(root, 'docs/release/ADIM_3_7_ENFORCE_DEPLOY.md'))) {
  console.error('✗ ADIM_3_7_ENFORCE_DEPLOY.md eksik')
  blocked = true
}

for (const [label, script] of [
  ['App Check client (3.3)', 'validate:app-check'],
  ['Firestore rules (3.1–3.6)', 'validate:firestore-rules'],
  ['Storage rules (3.5–3.6)', 'validate:storage-rules'],
  ['Firebase config (1.1)', 'validate:firebase'],
]) {
  process.stdout.write(`→ ${label}... `)
  const result = runNpm(script)
  if (result.ok) {
    console.log('OK')
  } else {
    console.log('BAŞARISIZ')
    if (result.output) console.error(result.output)
    blocked = true
  }
}

const firestoreRules = fs.readFileSync(path.join(root, 'firebase', 'firestore.rules'), 'utf8')
const storageRules = fs.readFileSync(path.join(root, 'firebase', 'storage.rules'), 'utf8')
if (!/function hasAppCheck/.test(firestoreRules) || !/function hasAppCheck/.test(storageRules)) {
  console.error('✗ Rules hasAppCheck yok — önce ADIM 3.6')
  blocked = true
} else {
  console.log('✓ Rules App Check (3.6) hazır')
}

const siteKey = readEnv('VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY')
if (!siteKey) {
  console.error('✗ VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY yok (.env.production)')
  console.error('  reCAPTCHA v3 site key → ADIM_3_3_APPCHECK.md')
  blocked = true
} else if (siteKey.length < 20 || siteKey.includes('YOUR_')) {
  console.error('✗ App Check site key placeholder görünüyor')
  blocked = true
} else {
  console.log('✓ App Check site key (.env.production)')
}

if (!fs.existsSync(path.join(root, '.env.production'))) {
  console.error('✗ .env.production yok — npm run firebase:init-env')
  blocked = true
}

let projectId = ''
try {
  projectId = JSON.parse(fs.readFileSync(path.join(root, '.firebaserc'), 'utf8')).projects?.default ?? ''
  if (!projectId || projectId.includes('YOUR_FIREBASE')) {
    console.error('✗ .firebaserc placeholder — npm run firebase:init-env')
    blocked = true
  } else {
    console.log(`✓ Proje: ${projectId}`)
  }
} catch {
  console.error('✗ .firebaserc okunamadı')
  blocked = true
}

const bin = firebaseBin()
if (!fs.existsSync(bin)) {
  console.error('✗ firebase-tools yok — npm install')
  blocked = true
} else {
  process.stdout.write('→ Firebase CLI oturumu... ')
  const login = spawnSync(bin, ['login:list'], { cwd: root, encoding: 'utf8', timeout: 15_000 })
  const loginOut = `${login.stdout ?? ''}${login.stderr ?? ''}`.trim()
  if (login.status !== 0 || /No authorized accounts|not logged in/i.test(loginOut)) {
    console.log('YOK')
    console.error('  npx firebase login')
    blocked = true
  } else {
    console.log('OK')
  }
}

if (!fs.existsSync(path.join(root, 'docs/release/SECURITY_TEST_CHECKLIST.md'))) {
  warnings.push('SECURITY_TEST_CHECKLIST.md eksik')
}

manual.push('Console → App Check → Web app → reCAPTCHA v3 kayıtlı mı?')
manual.push('Console → App Check → Monitoring: geçerli istekler görünüyor mu? (1–2 gün)')
manual.push('Console → Firestore + Storage → App Check → Enforce (Faz B)')
manual.push('Enforce sonrası: npm run deploy:security')
manual.push('2 hesap test: SECURITY_TEST_CHECKLIST.md (S8–S9, S13–S15)')

console.log()
for (const warning of warnings) console.warn('UYARI:', warning)

if (blocked) {
  console.error('\nPreflight durdu. Rehber: docs/release/ADIM_3_7_ENFORCE_DEPLOY.md')
  process.exit(1)
}

console.log('\nPreflight geçti.\n')
console.log('Sonraki komutlar (sırayla):')
console.log('  1. npm run deploy:app-check-rollout   # hosting (App Check client canlı)')
console.log('  2. Console → App Check → Enforce      # Firestore + Storage (manuel)')
console.log('  3. npm run deploy:security            # rules 3.6 deploy')
console.log('  4. 2 hesap test')
console.log('\nConsole kontrol listesi (manuel):')
for (const step of manual) console.log(`  • ${step}`)
