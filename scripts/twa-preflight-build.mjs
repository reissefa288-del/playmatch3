/**
 * ADIM 2.3 — Bubblewrap init/build ön koşulları.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const androidDir = path.join(root, 'android')
const errors = []
const warnings = []
const done = []

function exists(rel) {
  return fs.existsSync(path.join(root, rel))
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'))
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

function bubblewrap(args) {
  return spawnSync('npx', ['@bubblewrap/cli', ...args], {
    cwd: androidDir,
    encoding: 'utf8',
    shell: true,
    stdio: 'pipe',
    timeout: 120_000,
  })
}

const initOnly = process.argv.includes('--init-only')

console.log('ADIM 2.3 — Bubblewrap preflight\n')

const twaValidate = runNpm('validate:twa')
if (twaValidate.ok) {
  done.push('validate:twa')
} else {
  errors.push('validate:twa başarısız')
  if (twaValidate.output) console.error(twaValidate.output)
}

if (!initOnly) {
  const assetlinks = readJson('public/.well-known/assetlinks.json')
  const fp = assetlinks?.[0]?.target?.sha256_cert_fingerprints?.[0] ?? ''
  if (fp.includes('REPLACE_WITH')) {
    errors.push('assetlinks SHA-256 placeholder — önce ADIM 2.2 (twa:apply-fingerprint + deploy:hosting)')
  } else {
    done.push('assetlinks fingerprint dolu')
  }

  const keystoreDefault = path.join(androidDir, 'playmeet-upload.keystore')
  if (!fs.existsSync(keystoreDefault)) {
    errors.push('android/playmeet-upload.keystore yok — ADIM 2.2 keytool komutu')
  } else {
    done.push('upload keystore mevcut')
  }

  const signingProps = path.join(androidDir, 'signingKey.properties')
  if (!fs.existsSync(signingProps)) {
    warnings.push('android/signingKey.properties yok — signingKey.properties.example kopyala ve doldur')
  } else {
    done.push('signingKey.properties mevcut')
  }
}

const doctor = bubblewrap(['doctor'])
const doctorOut = `${doctor.stdout ?? ''}${doctor.stderr ?? ''}`.trim()
if (doctor.status === 0 && /valid/i.test(doctorOut)) {
  done.push('bubblewrap doctor (JDK + Android SDK)')
} else {
  errors.push('bubblewrap doctor başarısız — JDK 17+ ve Android SDK kur')
  if (doctorOut) console.error(doctorOut)
}

const projectMarkers = [
  'android/app/build.gradle',
  'android/app/src/main/AndroidManifest.xml',
  'android/settings.gradle',
]
const initialized = projectMarkers.some((rel) => exists(rel))
if (initialized) {
  done.push('Bubblewrap Android projesi mevcut')
} else {
  warnings.push('Bubblewrap projesi henüz init edilmedi — npm run twa:init')
}

if (done.length) {
  console.log('Tamamlanan:')
  for (const item of done) console.log('  ✓', item)
  console.log()
}

for (const warning of warnings) console.warn('UYARI:', warning)

if (errors.length) {
  console.error('\nEksik:\n')
  for (const error of errors) console.error('  ✗', error)
  console.error('\nRehber: docs/release/ADIM_2_3_BUBBLEWRAP.md')
  process.exit(1)
}

console.log('Preflight geçti.', initialized ? 'Build: npm run twa:build' : 'Init: npm run twa:init')
