/**
 * ADIM 2.2 — Keystore + fingerprint + assetlinks (tek komut).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')

function run(label, cmd, args) {
  process.stdout.write(`→ ${label}... `)
  const result = spawnSync(cmd, args, {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    stdio: 'pipe',
  })
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
  if (result.status === 0) {
    console.log('OK')
    return true
  }
  console.log('BAŞARISIZ')
  if (output) console.error(output)
  return false
}

console.log('ADIM 2.2 — TWA signing setup\n')

if (!run('Upload keystore', 'node', ['scripts/generate-twa-keystore.mjs'])) process.exit(1)
if (!run('SHA-256 fingerprint', 'node', ['scripts/extract-twa-fingerprint.mjs'])) process.exit(1)
if (!run('assetlinks + twa-manifest', 'node', ['scripts/apply-twa-fingerprint.mjs'])) process.exit(1)

const fp = fs.readFileSync(path.join(root, 'android', 'upload-fingerprint.txt'), 'utf8').trim()
console.log('\nFingerprint:', fp)
console.log('\nSonraki:')
console.log('  npm run deploy:hosting   # assetlinks canlıya')
console.log('  Firebase Console → Android app → SHA-1 + SHA-256 ekle')
console.log('  npm run twa:init -- --local-manifest')
console.log('  npm run twa:build')
