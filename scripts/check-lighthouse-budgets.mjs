/**
 * Validates performance/lighthouse-baseline.json against budgets.
 *
 * Usage:
 *   npm run perf:lighthouse:check              # regression floors (CI-safe)
 *   npm run perf:lighthouse:check -- --targets # aspirational targets
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const baselineFile = path.join(root, 'performance', 'lighthouse-baseline.json')
const budgetsFile = path.join(root, 'performance', 'budgets.json')

const strictTargets = process.argv.includes('--targets')

function loadJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function metricValue(route, key) {
  if (key === 'performanceScore') return route.performanceScore
  const map = {
    lcpMs: 'lcp',
    fcpMs: 'fcp',
    cls: 'cls',
    tbtMs: 'tbt',
  }
  const audit = route[map[key]]
  if (!audit) return null
  return audit.value ?? null
}

function compareRoute(routeId, route, limits, mode) {
  const failures = []
  for (const [key, limit] of Object.entries(limits)) {
    const value = metricValue(route, key)
    if (value == null) {
      failures.push(`${routeId}.${key}: missing metric`)
      continue
    }

    if (key === 'cls') {
      if (value > limit) {
        failures.push(`${routeId}.${key}: ${value} > ${limit}`)
      }
      continue
    }

    if (key === 'performanceScore') {
      if (value < limit) {
        failures.push(`${routeId}.${key}: ${value} < ${limit}`)
      }
      continue
    }

    // Lower is better (ms)
    if (value > limit) {
      failures.push(`${routeId}.${key}: ${Math.round(value)}ms > ${limit}ms`)
    }
  }
  return failures
}

function main() {
  if (!existsSync(baselineFile)) {
    console.error('Missing performance/lighthouse-baseline.json — run `npm run perf:lighthouse` first.')
    process.exit(1)
  }

  const baseline = loadJson(baselineFile)
  const budgets = loadJson(budgetsFile)
  const mode = strictTargets ? 'targets' : 'regression'
  const limits = strictTargets
    ? Object.fromEntries(
        Object.keys(budgets.lighthouse.regressionFloors).map((routeId) => [
          routeId,
          budgets.lighthouse.targets,
        ]),
      )
    : budgets.lighthouse.regressionFloors

  const failures = []
  const passes = []

  for (const [routeId, routeLimits] of Object.entries(limits)) {
    const route = baseline.routes?.[routeId]
    if (!route) {
      failures.push(`Route missing in baseline: ${routeId}`)
      continue
    }
    const routeFails = compareRoute(routeId, route, routeLimits, mode)
    if (routeFails.length) failures.push(...routeFails)
    else passes.push(routeId)
  }

  console.log(`PlayMeet Lighthouse check (${mode})\n`)
  passes.forEach((routeId) => console.log(`  OK ${routeId}`))

  if (failures.length) {
    console.error('\nLighthouse budget failures:')
    failures.forEach((line) => console.error(`  ✗ ${line}`))
    if (strictTargets) {
      console.error('\nNote: --targets uses aspirational goals; use default mode for CI regression guard.')
    }
    process.exit(1)
  }

  console.log(`\nLighthouse ${mode} check passed (${baseline.capturedAt}).`)
}

main()
