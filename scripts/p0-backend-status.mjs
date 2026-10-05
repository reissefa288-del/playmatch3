/**
 * P0 — Canlı backend hazırlık durumu (deploy etmeden kontrol).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const checks = []
let blocked = 0

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
  return result.status === 0
}

function status(label, ok, hint = '') {
  checks.push({ label, ok, hint })
  if (!ok) blocked += 1
  const icon = ok ? '✓' : '✗'
  console.log(`  ${icon} ${label}${hint ? ` — ${hint}` : ''}`)
}

console.log('P0 — Canlı backend durumu\n')

const hasEnv = fs.existsSync(path.join(root, '.env.production'))
status('1.4 .env.production', hasEnv, hasEnv ? '' : 'npm run firebase:init-env')

let projectId = ''
try {
  projectId = JSON.parse(fs.readFileSync(path.join(root, '.firebaserc'), 'utf8')).projects?.default ?? ''
} catch {
  /* ignore */
}
status(
  '1.4 .firebaserc project id',
  Boolean(projectId && !projectId.includes('YOUR_FIREBASE')),
  projectId && !projectId.includes('YOUR_FIREBASE') ? projectId : 'npm run firebase:init-env',
)

status(
  '3.3 App Check site key',
  Boolean(readEnv('VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY')),
  'VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY',
)

const configPath = path.join(root, 'firebase', 'firebase-web-config.json')
status(
  '1.3 firebase-web-config.json',
  fs.existsSync(configPath) && !fs.readFileSync(configPath, 'utf8').includes('your-project-id'),
  'Console config yapıştır',
)

const bin = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'firebase.cmd' : 'firebase')
let loggedIn = false
if (fs.existsSync(bin)) {
  const login = spawnSync(bin, ['login:list'], { cwd: root, encoding: 'utf8', timeout: 15_000 })
  const out = `${login.stdout ?? ''}${login.stderr ?? ''}`
  loggedIn = login.status === 0 && !/No authorized accounts|not logged in/i.test(out)
}
status('1.5 Firebase CLI login', loggedIn, loggedIn ? '' : 'npx firebase login')

status('Repo rules + indexes', runNpm('validate:firestore-rules'), '')
status('Functions scaffold', runNpm('validate:functions'), '')

console.log()
if (blocked === 0) {
  console.log('Hazır → npm run deploy:p0-backend')
  console.log('Console: Blaze plan aktif olmalı (Functions)')
} else {
  console.log(`${blocked} eksik. Rehber: docs/release/ADIM_P0_BACKEND.md`)
  process.exit(1)
}
