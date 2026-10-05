/**
 * ADIM 4.5 — Functions deploy öncesi kontroller (4.1 scaffold hazır olmalı).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
let blocked = false
const warnings = []

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

console.log('ADIM 4.5 — Functions deploy preflight\n')

process.stdout.write('→ validate:functions... ')
const validate = runNpm('validate:functions')
if (validate.ok) {
  console.log('OK')
} else {
  console.log('BAŞARISIZ')
  if (validate.output) console.error(validate.output)
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

warnings.push('Firebase Blaze (pay-as-you-go) plan gerekli — Console → Upgrade')
warnings.push('Deploy: npx firebase deploy --only functions')
warnings.push('Smoke: GET https://europe-west1-<project-id>.cloudfunctions.net/health')

console.log()
for (const warning of warnings) console.warn('UYARI:', warning)

if (blocked) {
  console.error('\nDeploy durdu. Rehber: docs/release/ADIM_4_1_FUNCTIONS.md')
  process.exit(1)
}

console.log('\nPreflight geçti. Deploy: npm run deploy:functions')
