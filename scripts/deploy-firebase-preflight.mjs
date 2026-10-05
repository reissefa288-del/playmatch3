/**
 * ADIM 1.5 — deploy öncesi zorunlu kontroller.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')

function runNpm(script) {
  const result = spawnSync('npm', ['run', script], {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    stdio: 'pipe',
  })
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
  return { ok: result.status === 0, output }
}

function firebaseBin() {
  return path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'firebase.cmd' : 'firebase')
}

console.log('ADIM 1.5 — Firebase deploy preflight\n')

const steps = [
  { name: 'Firebase kurulum (1.3–1.4)', script: 'firebase:verify-setup' },
  { name: 'Repo Firebase config (1.1)', script: 'validate:firebase' },
]

let blocked = false

for (const step of steps) {
  process.stdout.write(`→ ${step.name}... `)
  const result = runNpm(step.script)
  if (result.ok) {
    console.log('OK')
  } else {
    console.log('BAŞARISIZ')
    if (result.output) console.error(result.output)
    blocked = true
  }
}

const bin = firebaseBin()
if (!fs.existsSync(bin)) {
  console.error('\n✗ firebase-tools yok — npm install')
  process.exit(1)
}

process.stdout.write('→ Firebase CLI oturumu... ')
const login = spawnSync(bin, ['login:list'], { cwd: root, encoding: 'utf8', timeout: 15_000 })
const loginOut = `${login.stdout ?? ''}${login.stderr ?? ''}`.trim()
if (login.status !== 0 || /No authorized accounts|not logged in/i.test(loginOut)) {
  console.log('YOK')
  console.error('\nÖnce giriş yap (tarayıcı açılır):')
  console.error('  npx firebase login')
  blocked = true
} else {
  console.log('OK')
}

if (!blocked) {
  let projectId = ''
  try {
    projectId = JSON.parse(fs.readFileSync(path.join(root, '.firebaserc'), 'utf8')).projects?.default ?? ''
  } catch {
    blocked = true
  }
  if (projectId) {
    process.stdout.write(`→ Proje (${projectId})... `)
    const use = spawnSync(bin, ['use', projectId], { cwd: root, encoding: 'utf8', timeout: 15_000 })
    if (use.status === 0) {
      console.log('OK')
    } else {
      console.log('ERİŞİLEMİYOR')
      if (use.stderr) console.error(use.stderr.trim())
      blocked = true
    }
  }
}

if (blocked) {
  console.error('\nDeploy durdu. Sıra:')
  console.error('  1. ADIM 1.4: firebase/firebase-web-config.json doldur → npm run firebase:init-env')
  console.error('  2. npx firebase login')
  console.error('  3. npm run deploy:firebase')
  console.error('\nRehber: docs/release/FIREBASE_CONSOLE_SETUP.md')
  process.exit(1)
}

console.log('\nPreflight geçti. Deploy başlatılabilir.')
