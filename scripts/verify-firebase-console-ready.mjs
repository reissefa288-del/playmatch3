/**
 * ADIM 1.3 — Firebase Console kurulumu sonrası yerel hazırlık doğrulaması.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const errors = []
const warnings = []
const done = []

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'))
}

function readEnvFile(filename) {
  const file = path.join(root, filename)
  if (!fs.existsSync(file)) return null
  const vars = {}
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    vars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
  }
  return vars
}

const requiredEnv = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

if (!fs.existsSync(path.join(root, '.env.production'))) {
  errors.push('.env.production yok — ADIM 1.4: npm run firebase:init-env')
} else {
  const env = readEnvFile('.env.production')
  const missing = requiredEnv.filter((key) => !env?.[key] || env[key].includes('your-project'))
  if (missing.length) {
    errors.push(`Eksik/placeholder env: ${missing.join(', ')} — ADIM 1.4: npm run firebase:init-env`)
  } else {
    done.push('.env.production dolu')
    if (env.VITE_FIREBASE_PROJECT_ID !== env.VITE_FIREBASE_AUTH_DOMAIN?.split('.')[0]) {
      warnings.push('PROJECT_ID ile AUTH_DOMAIN ön eki uyuşmuyor olabilir — Console değerlerini kontrol et')
    }
    if (
      env.VITE_FIREBASE_STORAGE_BUCKET &&
      !env.VITE_FIREBASE_STORAGE_BUCKET.includes(env.VITE_FIREBASE_PROJECT_ID)
    ) {
      warnings.push('STORAGE_BUCKET project id ile uyumsuz görünüyor')
    }
  }
}

let projectId = ''
try {
  const rc = readJson('.firebaserc')
  projectId = rc.projects?.default ?? ''
  if (!projectId || projectId.includes('YOUR_FIREBASE')) {
    errors.push('.firebaserc placeholder — ADIM 1.4: npm run firebase:init-env')
  } else {
    done.push(`.firebaserc → ${projectId}`)
  }
} catch {
  errors.push('.firebaserc okunamadı')
}

const envFile = readEnvFile('.env.production')
if (projectId && envFile?.VITE_FIREBASE_PROJECT_ID && projectId !== envFile.VITE_FIREBASE_PROJECT_ID) {
  errors.push(
    `.firebaserc (${projectId}) ile VITE_FIREBASE_PROJECT_ID (${envFile.VITE_FIREBASE_PROJECT_ID}) eşleşmiyor`,
  )
}

for (const file of ['firebase/firestore.rules', 'firebase/storage.rules', 'firebase.json']) {
  if (!fs.existsSync(path.join(root, file))) {
    errors.push(`Eksik: ${file}`)
  }
}
if (!errors.some((e) => e.includes('firebase/'))) {
  done.push('Rules + firebase.json hazır (deploy bekliyor)')
}

const firebaseBin = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'firebase.cmd' : 'firebase')
const cliOpts = { cwd: root, encoding: 'utf8', timeout: 12_000 }

if (!fs.existsSync(firebaseBin)) {
  warnings.push('firebase-tools yüklü değil — `npm install` sonra ADIM 1.5')
} else {
  done.push('firebase-tools kurulu')
  const login = spawnSync(firebaseBin, ['login:list'], cliOpts)
  const out = `${login.stdout ?? ''}${login.stderr ?? ''}`.trim()
  if (login.error?.code === 'ETIMEDOUT') {
    warnings.push('Firebase CLI yanıt vermedi — ADIM 1.5: npx firebase login')
  } else if (login.status !== 0 || /No authorized accounts|not logged in/i.test(out)) {
    warnings.push('Firebase CLI girişi yok — ADIM 1.5: npx firebase login')
  } else {
    done.push('Firebase CLI oturumu açık')
  }
}

console.log('Firebase Console kurulum doğrulaması (ADIM 1.3)\n')
if (done.length) {
  console.log('Tamamlanan:')
  for (const item of done) console.log('  ✓', item)
  console.log()
}

if (warnings.length) {
  for (const warning of warnings) console.warn('UYARI:', warning)
  console.log()
}

if (errors.length) {
  console.error('Eksik (Console / env adımları):\n')
  for (const error of errors) console.error('  ✗', error)
  console.error('\nRehber: docs/release/FIREBASE_CONSOLE_SETUP.md')
  process.exit(1)
}

console.log('ADIM 1.4 tamam. Sıradaki: ADIM 1.5 deploy (npx firebase login + npm run deploy:firebase)')
