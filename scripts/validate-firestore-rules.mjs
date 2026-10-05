/**
 * ADIM 3.1 — firestore.rules statik doğrulama (deploy öncesi).
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const rulesPath = path.join(root, 'firebase', 'firestore.rules')
const examplePath = path.join(root, 'firebase', 'firestore.rules.example')
const errors = []

if (!fs.existsSync(rulesPath)) {
  console.error('firebase/firestore.rules eksik')
  process.exit(1)
}

const rules = fs.readFileSync(rulesPath, 'utf8')

const required = [
  ['ADIM 3.6 hasAppCheck helper', /function hasAppCheck\(\)/],
  ['isSignedIn requires App Check', /function isSignedIn\(\)[\s\S]*hasAppCheck\(\)/],
  ['ADIM 3.1 scoped users get', /allow get:.*isOwner\(userId\)/s],
  ['users list onboardingCompleted', /allow list:.*onboardingCompleted == true/s],
  ['isMatchPartner helper', /function isMatchPartner/],
  ['matchDocIdFor helper', /function matchDocIdFor/],
  ['reports read denied', /match \/reports\/\{reportId\}[\s\S]*allow read: if false/],
  ['dailyLikes owner read', /match \/dailyLikes\/\{userId\}[\s\S]*allow read: if isOwner\(userId\)/],
]

for (const [label, pattern] of required) {
  if (!pattern.test(rules)) errors.push(`Eksik/hatalı: ${label}`)
}

const usersBlock = rules.match(/match \/users\/\{userId\}[\s\S]*?(?=\n    match \/likes)/)?.[0] ?? ''
if (/allow read: if isSignedIn\(\)/.test(usersBlock)) {
  errors.push('users allow read: if isSignedIn() hâlâ var — scoped get/list kullan')
}

const likesBlock = rules.match(/match \/likes\/\{likeId\}[\s\S]*?(?=\n    function isMatchParticipant|\n    match \/matches)/)?.[0] ?? ''
if (/allow read: if isSignedIn\(\)/.test(likesBlock)) {
  errors.push('likes allow read: if isSignedIn() hâlâ var — scoped get/list kullan')
}
if (!/resource\.data\.fromUid == request\.auth\.uid \|\| resource\.data\.toUid == request\.auth\.uid/.test(likesBlock)) {
  errors.push('likes get — fromUid veya toUid participant kontrolü eksik')
}
if (!/allow list:.*fromUid == request\.auth\.uid/s.test(likesBlock)) {
  errors.push('likes list — sadece kendi gönderilen beğeniler (fromUid) eksik')
}

const matchesBlock = rules.match(/match \/matches\/\{matchId\}[\s\S]*?(?=\n    match \/dailyLikes)/)?.[0] ?? ''
if (!/allow create: if false/.test(matchesBlock)) {
  errors.push('matches allow create: if false eksik (ADIM 4.2 CF gate)')
}
if (!/allow update: if false/.test(matchesBlock)) {
  errors.push('matches allow update: if false eksik (ADIM 4.2 CF gate)')
}
if (!/request\.resource\.data\.source in \['discover', 'game'\]/.test(likesBlock)) {
  errors.push('likes create — source alanı eksik (ADIM 4.2)')
}

const dailyLikesBlock = rules.match(/match \/dailyLikes\/\{userId\}[\s\S]*?(?=\n    match \/reports)/)?.[0] ?? ''
if (!/allow create, update, delete: if false/.test(dailyLikesBlock)) {
  errors.push('dailyLikes client write kapalı değil (ADIM 4.3)')
}

if (fs.existsSync(examplePath)) {
  const example = fs.readFileSync(examplePath, 'utf8')
  if (example !== rules) {
    errors.push('firestore.rules.example senkron değil — example dosyasını güncelle')
  }
}

if (errors.length) {
  console.error('Firestore rules doğrulama BAŞARISIZ:\n')
  for (const error of errors) console.error(' -', error)
  process.exit(1)
}

console.log('Firestore rules doğrulaması geçti (3.x + 4.2 match gate).')
console.log('Deploy: npm run deploy:rules')
