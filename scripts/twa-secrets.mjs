/**
 * TWA keystore şifresi — android/.twa-secrets.local (gitignore).
 */
import fs from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'

const root = path.resolve(import.meta.dirname, '..')
const secretsFile = path.join(root, 'android', '.twa-secrets.local')

export function readTwaKeystorePassword() {
  if (process.env.TWA_KEYSTORE_PASSWORD?.trim()) {
    return process.env.TWA_KEYSTORE_PASSWORD.trim()
  }
  if (fs.existsSync(secretsFile)) {
    for (const line of fs.readFileSync(secretsFile, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const value = trimmed.slice(idx + 1).trim()
      if (key === 'TWA_KEYSTORE_PASSWORD' && value) return value
    }
  }
  return ''
}

export function ensureTwaKeystorePassword() {
  const existing = readTwaKeystorePassword()
  if (existing) return existing

  const generated = randomBytes(18).toString('base64url')
  fs.mkdirSync(path.dirname(secretsFile), { recursive: true })
  const body = [
    '# Otomatik oluşturuldu — yedekle, commit etme',
    '# Override: TWA_KEYSTORE_PASSWORD env veya bu dosyayı düzenle',
    `TWA_KEYSTORE_PASSWORD=${generated}`,
    '',
  ].join('\n')
  fs.writeFileSync(secretsFile, body, 'utf8')
  console.log('Oluşturuldu: android/.twa-secrets.local (keystore şifresi)')
  return generated
}

export function writeSigningKeyProperties(password) {
  const target = path.join(root, 'android', 'signingKey.properties')
  const body = [
    '# Otomatik — gitignore (commit etme)',
    'storeFile=playmeet-upload.keystore',
    `storePassword=${password}`,
    'keyAlias=playmeet',
    `keyPassword=${password}`,
    '',
  ].join('\n')
  fs.writeFileSync(target, body, 'utf8')
}
