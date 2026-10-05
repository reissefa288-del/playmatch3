/**
 * ADIM 2.2 — upload keystore SHA-256 çıkar.
 *
 * npm run twa:fingerprint -- --keystore android/playmeet-upload.keystore --alias playmeet
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { normalizeSha256Fingerprint, parseKeytoolOutput } from './twa-fingerprint-utils.mjs'
import { readTwaKeystorePassword } from './twa-secrets.mjs'

const root = path.resolve(import.meta.dirname, '..')

function arg(name, fallback = '') {
  const argv = process.argv.slice(2)
  const idx = argv.indexOf(name)
  return idx >= 0 && argv[idx + 1] ? argv[idx + 1] : fallback
}

const keystore = path.resolve(root, arg('--keystore', 'android/playmeet-upload.keystore'))
const alias = arg('--alias', 'playmeet')
const outFile = path.resolve(root, arg('--out', 'android/upload-fingerprint.txt'))

if (!fs.existsSync(keystore)) {
  console.error('Keystore bulunamadı:', path.relative(root, keystore))
  console.error('\nÖnce oluştur (ADIM 2.2):')
  console.error(
    '  keytool -genkeypair -v -keystore android/playmeet-upload.keystore -alias playmeet -keyalg RSA -keysize 2048 -validity 10000',
  )
  process.exit(1)
}

const storepass = arg('--storepass', readTwaKeystorePassword())

const keytoolArgs = ['-list', '-v', '-keystore', keystore, '-alias', alias]
if (storepass) {
  keytoolArgs.push('-storepass', storepass)
}

const result = spawnSync('keytool', keytoolArgs, { encoding: 'utf8' })

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
if (result.status !== 0) {
  console.error('keytool başarısız. JDK kurulu mu? Şifre doğru mu?\n')
  console.error(output.trim())
  process.exit(1)
}

const fingerprint = parseKeytoolOutput(output)
if (!fingerprint) {
  console.error('keytool çıktısında SHA-256 bulunamadı.')
  process.exit(1)
}

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, `${fingerprint}\n`, 'utf8')

console.log('SHA-256 fingerprint:')
console.log(fingerprint)
console.log('\nKaydedildi:', path.relative(root, outFile))
console.log('Uygula: npm run twa:apply-fingerprint')
