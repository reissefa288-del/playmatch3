/**
 * ADIM 2.2 — Upload keystore oluştur (non-interactive).
 *
 * npm run twa:keystore
 * TWA_KEYSTORE_PASSWORD=... npm run twa:keystore
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { ensureTwaKeystorePassword, writeSigningKeyProperties } from './twa-secrets.mjs'

const root = path.resolve(import.meta.dirname, '..')
const keystore = path.join(root, 'android', 'playmeet-upload.keystore')
const alias = 'playmeet'

if (fs.existsSync(keystore)) {
  console.log('Keystore zaten var:', path.relative(root, keystore))
  const password = ensureTwaKeystorePassword()
  writeSigningKeyProperties(password)
  console.log('signingKey.properties güncellendi')
  process.exit(0)
}

const password = ensureTwaKeystorePassword()
if (!password || password.length < 8) {
  console.error('Keystore şifresi en az 8 karakter olmalı (TWA_KEYSTORE_PASSWORD veya .twa-secrets.local)')
  process.exit(1)
}

fs.mkdirSync(path.dirname(keystore), { recursive: true })

const dname = 'CN=PlayMeet, OU=Mobile, O=PlayMeet, L=Istanbul, ST=Istanbul, C=TR'
const result = spawnSync(
  'keytool',
  [
    '-genkeypair',
    '-v',
    '-keystore',
    keystore,
    '-alias',
    alias,
    '-keyalg',
    'RSA',
    '-keysize',
    '2048',
    '-validity',
    '10000',
    '-storepass',
    password,
    '-keypass',
    password,
    '-dname',
    dname,
  ],
  { encoding: 'utf8' },
)

const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
if (result.status !== 0) {
  console.error('keytool keystore oluşturamadı:\n', output)
  process.exit(1)
}

writeSigningKeyProperties(password)
console.log('Upload keystore oluşturuldu:', path.relative(root, keystore))
console.log('signingKey.properties yazıldı')
console.log('\nSonraki: npm run twa:setup-signing')
