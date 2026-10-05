/**
 * ADIM 4.1 — Cloud Functions proje doğrulama.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const functionsDir = path.join(root, 'functions')
const errors = []

function exists(rel) {
  return fs.existsSync(path.join(root, rel))
}

const requiredFiles = [
  'functions/package.json',
  'functions/tsconfig.json',
  'functions/src/index.ts',
  'functions/src/lib/firebaseAdmin.ts',
  'functions/src/lib/ids.ts',
  'functions/src/triggers/onLikeCreated.ts',
  'functions/src/lib/ensureMatch.ts',
  'functions/src/types/firestore.ts',
  'functions/src/callables/consumeDailyLike.ts',
  'functions/src/callables/deleteMyAccount.ts',
  'functions/src/callables/syncPremiumEntitlement.ts',
  'functions/src/lib/premiumEntitlement.ts',
  'functions/src/triggers/onUserDeleted.ts',
  'functions/src/lib/dailyLikes.ts',
  'functions/src/lib/deleteUserCascade.ts',
  'functions/src/triggers/onPushNotifications.ts',
  'functions/src/lib/pushNotifications.ts',
  'docs/release/ADIM_4_3_DAILY_LIKES.md',
  'docs/release/ADIM_9_1_FCM.md',
]

for (const file of requiredFiles) {
  if (!exists(file)) errors.push(`Eksik: ${file}`)
}

if (!exists('firebase.json')) {
  errors.push('firebase.json eksik')
} else {
  const firebaseJson = JSON.parse(fs.readFileSync(path.join(root, 'firebase.json'), 'utf8'))
  if (!firebaseJson.functions?.length) {
    errors.push('firebase.json functions yapılandırması eksik')
  }
}

const pkg = JSON.parse(fs.readFileSync(path.join(functionsDir, 'package.json'), 'utf8'))
for (const dep of ['firebase-admin', 'firebase-functions']) {
  if (!pkg.dependencies?.[dep]) errors.push(`functions/package.json ${dep} eksik`)
}
if (pkg.engines?.node !== '20') {
  errors.push(`functions Node engine 20 olmalı (şu an: ${pkg.engines?.node ?? 'yok'})`)
}

const indexSrc = fs.readFileSync(path.join(functionsDir, 'src/index.ts'), 'utf8')
if (!/consumeDailyLike/.test(indexSrc)) {
  errors.push('functions/src/index.ts consumeDailyLike export eksik')
}
if (!/cascadeDeleteAccount/.test(indexSrc)) {
  errors.push('functions/src/index.ts cascadeDeleteAccount export eksik')
}
if (!/onLikeCreated/.test(indexSrc)) {
  errors.push('functions/src/index.ts onLikeCreated export eksik')
}
if (!/onMatchCreatedPush/.test(indexSrc) || !/onMessageCreatedPush/.test(indexSrc)) {
  errors.push('functions/src/index.ts push trigger export eksik (9.1)')
}
if (!/deleteMyAccount/.test(indexSrc)) {
  errors.push('functions/src/index.ts deleteMyAccount export eksik (11.3)')
}
if (!/syncPremiumEntitlement/.test(indexSrc)) {
  errors.push('functions/src/index.ts syncPremiumEntitlement export eksik (8.2)')
}
if (!/export const health/.test(indexSrc)) {
  errors.push('functions/src/index.ts health export eksik')
}

if (errors.length) {
  console.error('Functions doğrulama BAŞARISIZ:\n')
  for (const error of errors) console.error(' -', error)
  process.exit(1)
}

if (!fs.existsSync(path.join(functionsDir, 'node_modules'))) {
  console.error('functions/node_modules yok — cd functions && npm install')
  process.exit(1)
}

process.stdout.write('→ functions build... ')
const build = spawnSync('npm', ['run', 'build'], {
  cwd: functionsDir,
  encoding: 'utf8',
  shell: true,
  stdio: 'pipe',
})
const buildOut = [build.stdout, build.stderr].filter(Boolean).join('\n').trim()
if (build.status !== 0) {
  console.log('BAŞARISIZ')
  if (buildOut) console.error(buildOut)
  process.exit(1)
}
console.log('OK')

if (!fs.existsSync(path.join(functionsDir, 'lib', 'index.js'))) {
  console.error('functions/lib/index.js oluşmadı')
  process.exit(1)
}

console.log('Cloud Functions doğrulaması geçti (4.1–4.4).')
console.log('Deploy (4.5): npm run functions:preflight → Blaze plan gerekli')
