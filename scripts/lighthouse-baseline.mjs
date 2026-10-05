/**
 * PlayMeet Lighthouse baseline — production preview audit.
 *
 * Usage:
 *   npm run lighthouse:baseline
 *
 * Requires a one-time build (`npm run build`). Writes:
 *   performance/lighthouse-baseline.json
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleDistRequest } from './serve-dist-static.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const distDir = path.join(root, 'dist')
const outDir = path.join(root, 'performance')
const outFile = path.join(outDir, 'lighthouse-baseline.json')
const port = 4173

const budgetsFile = path.join(outDir, 'budgets.json')

const ROUTES = [
  { id: 'home', path: '/' },
  { id: 'games', path: '/games' },
  { id: 'match', path: '/match' },
  { id: 'chat', path: '/chat' },
  { id: 'profile', path: '/profile' },
  { id: 'premium', path: '/premium' },
]

function loadTargets() {
  try {
    const raw = readFileSync(budgetsFile, 'utf8')
    return JSON.parse(raw).lighthouse?.targets ?? null
  } catch {
    return null
  }
}

const TARGETS = loadTargets() ?? {
  performanceScore: 85,
  lcpMs: 2500,
  cls: 0.1,
  fcpMs: 1800,
  tbtMs: 300,
}

const SEED_SCRIPT = `
localStorage.setItem('pm-auth-session', JSON.stringify({
  provider: 'google',
  acceptedTerms: true,
  acceptedPrivacy: true,
  signedInAt: Date.now(),
  displayName: 'Lighthouse QA',
  email: 'lighthouse@playmeet.test',
  avatarUrl: ''
}));
localStorage.setItem('pm-user-profile', JSON.stringify({
  name: 'Lighthouse',
  age: 24,
  matchPreference: 'both',
  photoUrl: '',
  photoUrls: ['', '', ''],
  interests: ['Gamer', 'FPS', 'Strateji', 'Sohbet'],
  bio: 'Performance audit seed profile',
  email: 'lighthouse@playmeet.test',
  onboardingCompleted: true,
  completedAt: Date.now()
}));
`

function run(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true, ...options })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve(undefined)
      else reject(new Error(`${cmd} exited with code ${code}`))
    })
  })
}

function waitForServer(url, timeoutMs = 30_000) {
  const started = Date.now()
  return new Promise((resolve, reject) => {
    const tick = () => {
      fetch(url)
        .then((res) => {
          if (res.ok || res.status === 404) resolve(undefined)
          else retry()
        })
        .catch(retry)

      function retry() {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Server did not respond at ${url}`))
          return
        }
        setTimeout(tick, 250)
      }
    }
    tick()
  })
}

function startStaticServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      handleDistRequest(req, res, distDir)
    })

    server.listen(port, '127.0.0.1', () => resolve(server))
  })
}

function auditMetric(audits, id) {
  const audit = audits[id]
  if (!audit) return null
  return {
    score: audit.score,
    value: audit.numericValue ?? audit.displayValue ?? null,
    displayValue: audit.displayValue ?? null,
  }
}

async function seedAuthSession(baseUrl, chromePort) {
  const puppeteer = await import('puppeteer-core')
  const browser = await puppeteer.default.connect({
    browserURL: `http://127.0.0.1:${chromePort}`,
  })
  try {
    const page = await browser.newPage()
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
    await page.evaluate(SEED_SCRIPT)
    await page.close()
  } finally {
    browser.disconnect()
  }
}

async function runLighthouse(url, chromePort) {
  const lighthouseModule = await import('lighthouse')
  const runner = lighthouseModule.default ?? lighthouseModule
  const result = await runner(
    url,
    {
      port: chromePort,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance'],
    },
    {
      extends: 'lighthouse:default',
      settings: {
        disableStorageReset: true,
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 2,
          disabled: false,
        },
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
      },
    },
  )

  const lhr = result.lhr ?? result
  const audits = lhr.audits ?? {}
  return {
    performanceScore: Math.round((lhr.categories?.performance?.score ?? 0) * 100),
    fcp: auditMetric(audits, 'first-contentful-paint'),
    lcp: auditMetric(audits, 'largest-contentful-paint'),
    cls: auditMetric(audits, 'cumulative-layout-shift'),
    tbt: auditMetric(audits, 'total-blocking-time'),
    inp:
      auditMetric(audits, 'interaction-to-next-paint') ??
      auditMetric(audits, 'experimental-interaction-to-next-paint'),
    speedIndex: auditMetric(audits, 'speed-index'),
  }
}

async function gitHead() {
  try {
    const { execSync } = await import('node:child_process')
    return execSync('git rev-parse --short HEAD', { cwd: root, encoding: 'utf8' }).trim()
  } catch {
    return null
  }
}

async function main() {
  if (!existsSync(distDir)) {
    console.log('Building production bundle…')
    await run('npm', ['run', 'build:production'], { cwd: root })
  }

  mkdirSync(outDir, { recursive: true })
  const server = await startStaticServer()
  const baseUrl = `http://127.0.0.1:${port}`

  const chromeLauncher = await import('chrome-launcher')
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  })

  try {
    await waitForServer(baseUrl)
    await seedAuthSession(baseUrl, chrome.port)

    const routes = {}
    for (const route of ROUTES) {
      const url = `${baseUrl}${route.path}`
      console.log(`\nLighthouse: ${route.id} (${url})`)
      routes[route.id] = {
        path: route.path,
        url,
        ...(await runLighthouse(url, chrome.port)),
      }
    }

    const payload = {
      capturedAt: new Date().toISOString(),
      commit: await gitHead(),
      environment: 'production-static-preview',
      device: 'mobile-emulated',
      throttling: 'slow-4g-cpu-4x',
      authSeed: 'pm-auth-session + pm-user-profile (onboarding complete)',
      targets: TARGETS,
      routes,
    }

    writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    console.log(`\nBaseline saved → ${path.relative(root, outFile)}`)
  } finally {
    await chrome.kill()
    server.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
