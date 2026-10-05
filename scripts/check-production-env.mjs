import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

function readEnvFile(filename) {
  const file = path.join(root, filename)
  if (!fs.existsSync(file)) return {}
  const vars = {}
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    vars[key] = value
  }
  return vars
}

const env = {
  ...readEnvFile('.env.production'),
  ...readEnvFile('.env.production.local'),
  ...readEnvFile('.env.local'),
}

const missing = required.filter((key) => !env[key] || env[key].includes('your-project'))
const warnings = []

if (!env.VITE_FIREBASE_AUTH_DOMAIN?.includes('.')) {
  warnings.push('VITE_FIREBASE_AUTH_DOMAIN format looks invalid.')
}
if (env.VITE_FIREBASE_STORAGE_BUCKET && !env.VITE_FIREBASE_STORAGE_BUCKET.includes('appspot.com') && !env.VITE_FIREBASE_STORAGE_BUCKET.includes('firebasestorage.app')) {
  warnings.push('VITE_FIREBASE_STORAGE_BUCKET may be incorrect for Firebase Storage.')
}
if (!env.VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY) {
  warnings.push('VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY missing — App Check disabled until set (ADIM 3.3)')
}

if (!env.VITE_SENTRY_DSN) {
  warnings.push('VITE_SENTRY_DSN missing — Sentry crash/perf monitoring disabled (ADIM 12.3)')
}

if (missing.length > 0) {
  console.error('Missing or placeholder production Firebase env vars:')
  for (const key of missing) console.error(' -', key)
  console.error('\nCopy .env.example → .env.production and fill Firebase Console values.')
  process.exit(1)
}

console.log('Production Firebase env check passed.')
for (const warning of warnings) console.warn('WARN:', warning)
