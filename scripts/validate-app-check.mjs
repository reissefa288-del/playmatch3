/**
 * ADIM 3.3 — App Check client + env doğrulama.
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const errors = []
const warnings = []

function mustExist(rel, label) {
  if (!fs.existsSync(path.join(root, rel))) errors.push(`${label} eksik: ${rel}`)
}

mustExist('src/features/auth/firebaseAppCheck.ts', 'App Check modülü')

const firebaseApp = fs.readFileSync(path.join(root, 'src/features/auth/firebaseApp.ts'), 'utf8')
if (!/initFirebaseAppCheck/.test(firebaseApp)) {
  errors.push('firebaseApp.ts initFirebaseAppCheck çağırmıyor')
}

const appCheckSrc = fs.readFileSync(path.join(root, 'src/features/auth/firebaseAppCheck.ts'), 'utf8')
for (const needle of ['ReCaptchaV3Provider', 'initializeAppCheck', 'isTokenAutoRefreshEnabled']) {
  if (!appCheckSrc.includes(needle)) errors.push(`firebaseAppCheck.ts eksik: ${needle}`)
}

if (!fs.readFileSync(path.join(root, 'src/vite-env.d.ts'), 'utf8').includes('VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY')) {
  errors.push('vite-env.d.ts App Check env tipleri eksik')
}

if (!fs.readFileSync(path.join(root, '.env.production.example'), 'utf8').includes('VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY')) {
  errors.push('.env.production.example App Check key eksik')
}

if (!fs.existsSync(path.join(root, 'docs/release/ADIM_3_3_APPCHECK.md'))) {
  errors.push('ADIM_3_3_APPCHECK.md eksik')
}

function readEnv(name) {
  for (const file of ['.env.production', '.env.local', '.env.production.local']) {
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

const siteKey = readEnv('VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY')
if (!siteKey) {
  warnings.push('VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY yok — production App Check kapalı kalır')
} else {
  console.log('App Check site key yapılandırılmış.')
}

if (errors.length) {
  console.error('App Check doğrulama BAŞARISIZ:\n')
  for (const error of errors) console.error(' -', error)
  process.exit(1)
}

console.log('App Check client doğrulaması geçti (ADIM 3.3).')
for (const warning of warnings) console.warn('UYARI:', warning)
console.log('Console: docs/release/ADIM_3_3_APPCHECK.md')
