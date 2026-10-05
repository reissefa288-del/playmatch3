/**
 * P0 — Android TWA paketi durumu.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
let blocked = 0

function status(label, ok, hint = '') {
  if (!ok) blocked += 1
  console.log(`  ${ok ? '✓' : '✗'} ${label}${hint ? ` — ${hint}` : ''}`)
}

function readAssetlinksFingerprint() {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(root, 'public', '.well-known', 'assetlinks.json'), 'utf8'))
    return data?.[0]?.target?.sha256_cert_fingerprints?.[0] ?? ''
  } catch {
    return ''
  }
}

function findAab() {
  const androidDir = path.join(root, 'android')
  const found = []
  function walk(dir) {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.aab')) found.push(full)
    }
  }
  walk(androidDir)
  return found.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0] ?? null
}

console.log('P0 — Android uygulama paketi\n')

status('JDK + Android SDK', spawnSync('npx', ['@bubblewrap/cli', 'doctor'], {
  cwd: path.join(root, 'android'),
  shell: true,
  stdio: 'pipe',
  encoding: 'utf8',
}).status === 0, 'npx @bubblewrap/cli doctor')

status('validate:twa şablon', spawnSync('npm', ['run', 'validate:twa'], {
  cwd: root,
  shell: true,
  stdio: 'pipe',
}).status === 0)

const keystore = fs.existsSync(path.join(root, 'android', 'playmeet-upload.keystore'))
status('2.2 Upload keystore', keystore, keystore ? '' : 'npm run twa:setup-signing')

const fp = readAssetlinksFingerprint()
status('2.2 assetlinks fingerprint', Boolean(fp && !fp.includes('REPLACE_WITH')), fp ? fp.slice(0, 20) + '…' : 'twa:setup-signing')

status('2.3 signingKey.properties', fs.existsSync(path.join(root, 'android', 'signingKey.properties')))

const initialized = fs.existsSync(path.join(root, 'android', 'app', 'build.gradle'))
status('2.3 Bubblewrap projesi', initialized, initialized ? '' : 'npm run twa:init -- --local-manifest')

const aab = findAab()
status('2.3 Release AAB', Boolean(aab), aab ? path.relative(root, aab) : 'npm run twa:build')

console.log()
if (blocked === 0) {
  console.log('Android paketi hazır → Play Console’a AAB yükle (ADIM 2.4 / 2.6)')
} else {
  console.log(`${blocked} eksik. Rehber: docs/release/ADIM_P0_ANDROID.md`)
  if (!blocked || blocked > 0) process.exit(1)
}
