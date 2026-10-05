/**
 * Validates production dist/ assets against performance/budgets.json.
 *
 * Usage:
 *   npm run build && npm run perf:budgets
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const distAssets = path.join(root, 'dist', 'assets')
const budgetsFile = path.join(root, 'performance', 'budgets.json')

function readBudgets() {
  return JSON.parse(readFileSync(budgetsFile, 'utf8'))
}

function gzipKb(filePath) {
  const buf = readFileSync(filePath)
  return gzipSync(buf).length / 1024
}

function listAssets(ext) {
  if (!existsSync(distAssets)) return []
  return readdirSync(distAssets)
    .filter((name) => name.endsWith(ext))
    .map((name) => ({
      name,
      path: path.join(distAssets, name),
      gzipKb: gzipKb(path.join(distAssets, name)),
    }))
}

function budgetBaseName(key) {
  return key.replace(/\.(js|css)$/i, '')
}

function matchBudgetKey(fileName, budgetKey) {
  const wanted = budgetBaseName(budgetKey)
  const ext = /\.css$/i.test(budgetKey) ? '.css' : '.js'
  if (!fileName.endsWith(ext)) return false
  if (fileName === `${wanted}${ext}`) return true
  if (!fileName.startsWith(`${wanted}-`)) return false
  const rest = fileName.slice(`${wanted}-`.length, -ext.length)
  // Named sub-chunks: game-1942-arena-HASH (lowercase segment before hash)
  if (/^[a-z][a-z0-9]*-[A-Za-z0-9]/.test(rest)) return false
  return true
}

function findAsset(assets, budgetKey) {
  return assets.find((asset) => matchBudgetKey(asset.name, budgetKey))
}

function formatKb(value) {
  return `${value.toFixed(2)} KB gzip`
}

function main() {
  if (!existsSync(distAssets)) {
    console.error('dist/assets not found — run `npm run build` first.')
    process.exit(1)
  }

  const budgets = readBudgets()
  const jsAssets = listAssets('.js')
  const cssAssets = listAssets('.css')
  const failures = []
  const notes = []

  for (const pattern of budgets.bundle.forbiddenChunkPatterns ?? []) {
    const hit = jsAssets.find((asset) => asset.name.includes(pattern))
    if (hit) {
      failures.push(`Forbidden chunk present: ${hit.name} (matches "${pattern}")`)
    }
  }

  for (const [key, limitKb] of Object.entries(budgets.bundle.gzipKb ?? {})) {
    const pool = key.endsWith('.css') ? cssAssets : jsAssets
    const asset = findAsset(pool, key)
    if (!asset) {
      notes.push(`Skip missing budget key (optional chunk): ${key}`)
      continue
    }
    if (asset.gzipKb > limitKb) {
      failures.push(
        `${asset.name}: ${formatKb(asset.gzipKb)} exceeds budget ${limitKb} KB gzip`,
      )
    } else {
      notes.push(`OK ${asset.name}: ${formatKb(asset.gzipKb)} / ${limitKb} KB`)
    }
  }

  const indexJs = findAsset(jsAssets, 'index')
  const vendorReact = findAsset(jsAssets, 'vendor-react')
  const rolldown = findAsset(jsAssets, 'rolldown-runtime')
  if (indexJs && vendorReact) {
    const initialJs =
      indexJs.gzipKb + vendorReact.gzipKb + (rolldown?.gzipKb ?? 0)
    const maxInitial = budgets.bundle.maxInitialJsGzipKb
    if (initialJs > maxInitial) {
      failures.push(
        `Initial JS ${formatKb(initialJs)} exceeds max ${maxInitial} KB gzip`,
      )
    } else {
      notes.push(`OK initial JS: ${formatKb(initialJs)} / ${maxInitial} KB`)
    }
  }

  const indexCss = findAsset(cssAssets, 'index')
  if (indexCss) {
    const maxCss = budgets.bundle.maxInitialCssGzipKb
    if (indexCss.gzipKb > maxCss) {
      failures.push(
        `Initial CSS ${formatKb(indexCss.gzipKb)} exceeds max ${maxCss} KB gzip`,
      )
    } else {
      notes.push(`OK initial CSS: ${formatKb(indexCss.gzipKb)} / ${maxCss} KB`)
    }
  }

  const tabKeys = ['HomeScreenBody', 'home-shell', 'GamesScreenBody', 'GamesScreen', 'MatchScreen']
  const maxTab = budgets.bundle.maxLazyTabJsGzipKb
  for (const tabKey of tabKeys) {
    const asset = findAsset(jsAssets, tabKey)
    if (asset && asset.gzipKb > maxTab) {
      failures.push(`${asset.name}: tab chunk ${formatKb(asset.gzipKb)} > ${maxTab} KB`)
    }
  }

  console.log('PlayMeet bundle budget check\n')
  notes.forEach((line) => console.log(`  ${line}`))

  if (failures.length) {
    console.error('\nBudget failures:')
    failures.forEach((line) => console.error(`  ✗ ${line}`))
    process.exit(1)
  }

  console.log('\nAll bundle budgets passed.')
}

main()
