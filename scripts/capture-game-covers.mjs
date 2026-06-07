import { mkdir, copyFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium, devices } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '../src/reference/covers')
const baseUrl = process.env.PM_DEV_URL ?? 'http://localhost:5173'

const authSession = JSON.stringify({
  provider: 'google',
  acceptedTerms: true,
  acceptedPrivacy: true,
  signedInAt: Date.now(),
  displayName: 'Emirhan',
  email: 'emir@playmeet.test',
  avatarUrl: '',
})

const userProfile = JSON.stringify({
  name: 'Emirhan',
  age: 24,
  matchPreference: 'both',
  photoUrl: '',
  interests: ['Gamer'],
  bio: 'Test',
  email: 'emir@playmeet.test',
  onboardingCompleted: true,
  completedAt: Date.now(),
})

const games = [
  { path: '/games/color-match/play', file: 'color-match-duel.jpeg' },
  { path: '/games/snake-duel/play', file: 'snake-duel.jpeg' },
  { path: '/games/pong-duel/play', file: 'pong-duel.jpeg' },
  { path: '/games/simon-duel/play', file: 'simon-duel.jpeg' },
]

async function main() {
  await mkdir(outDir, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({
    ...devices['Pixel 5'],
    locale: 'tr-TR',
  })

  await context.addInitScript(
    ({ auth, profile }) => {
      localStorage.setItem('pm-auth-session', auth)
      localStorage.setItem('pm-user-profile', profile)
    },
    { auth: authSession, profile: userProfile },
  )

  const page = await context.newPage()

  for (const game of games) {
    await page.goto(`${baseUrl}${game.path}`, { waitUntil: 'networkidle', timeout: 45000 })
    await page.waitForTimeout(1800)
    await page.screenshot({
      path: path.join(outDir, game.file),
      type: 'jpeg',
      quality: 90,
    })
    console.log(`Captured ${game.file}`)
  }

  await browser.close()
}

main().catch(async (error) => {
  console.error(error)
  process.exitCode = 1
})
