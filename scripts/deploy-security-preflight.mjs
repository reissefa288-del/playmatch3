/**
 * ADIM 3.4–3.6 — Firestore + Storage rules deploy öncesi kontroller.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
let blocked = false
const warnings = []

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

console.log('ADIM 3.4–3.6 — Security rules deploy preflight\n')

for (const [label, script] of [
  ['Firestore rules (3.1–3.2, 3.6)', 'validate:firestore-rules'],
  ['Storage rules (3.5–3.6)', 'validate:storage-rules'],
  ['App Check client (3.3)', 'validate:app-check'],
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

for (const file of ['firebase/firestore.rules', 'firebase/storage.rules', 'firebase/firestore.indexes.json']) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`✗ Eksik: ${file}`)
    blocked = true
  }
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
    if (projectId && !projectId.includes('YOUR_FIREBASE')) {
      process.stdout.write(`→ firebase use ${projectId}... `)
      const use = spawnSync(bin, ['use', projectId], { cwd: root, encoding: 'utf8', timeout: 15_000 })
      console.log(use.status === 0 ? 'OK' : 'ERİŞİLEMİYOR')
      if (use.status !== 0) blocked = true
    }
  }
}

if (!fs.existsSync(path.join(root, '.env.production'))) {
  warnings.push('.env.production yok — hosting/App Check için gerekli')
}

const firestoreRules = fs.readFileSync(path.join(root, 'firebase', 'firestore.rules'), 'utf8')
const storageRules = fs.readFileSync(path.join(root, 'firebase', 'storage.rules'), 'utf8')
const rulesRequireAppCheck = /function hasAppCheck/.test(firestoreRules) && /function hasAppCheck/.test(storageRules)
const siteKey = readEnv('VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY')

if (rulesRequireAppCheck) {
  if (!siteKey) {
    console.error('✗ Rules App Check zorunlu (3.6) ama VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY yok')
    console.error('  Önce: hosting deploy + Console enforce — ADIM_3_6_APPCHECK_RULES.md')
    blocked = true
  } else {
    console.log('✓ App Check site key (.env.production)')
  }
}

console.log()
for (const warning of warnings) console.warn('UYARI:', warning)

if (blocked) {
  console.error('\nDeploy durdu. Rehber: docs/release/ADIM_3_4_DEPLOY_TEST.md')
  process.exit(1)
}

console.log('\nPreflight geçti. Deploy: npm run deploy:security')
console.log('App Check rules: docs/release/ADIM_3_6_APPCHECK_RULES.md')
console.log('Sonra: 2 hesap test — docs/release/SECURITY_TEST_CHECKLIST.md')
