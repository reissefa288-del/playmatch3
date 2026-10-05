/**
 * P0: index.js must not statically import game route chunks (1942, xox, block).
 * Those belong on lazy game routes only — not the Home/Chat critical path.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const assetsDir = path.join(distDir, 'assets')

const FORBIDDEN_INDEX_IMPORTS = ['game-1942', 'game-xox', 'game-block']
const FORBIDDEN_INDEX_STYLES = ['game-1942', 'game-xox', 'game-block']

function findChunkJs(namePrefix) {
  if (!existsSync(assetsDir)) return null
  return readdirSync(assetsDir).find((name) => name.startsWith(`${namePrefix}-`) && name.endsWith('.js')) ?? null
}

function checkJsChunk(fileName, label) {
  const failures = []
  const js = readFileSync(path.join(assetsDir, fileName), 'utf8')
  for (const pattern of FORBIDDEN_INDEX_IMPORTS) {
    const re = new RegExp(`from\\s*[\"']\\.\\/${pattern}-[^\"']+\\.js[\"']`)
    if (re.test(js)) {
      failures.push(`${label} imports forbidden chunk: ${pattern}`)
    }
  }
  return failures
}

function main() {
  const indexJsName = findChunkJs('index')
  const appShellJsName = findChunkJs('app-shell')
  if (!indexJsName) {
    console.error('dist/assets/index-*.js not found — run `npm run build` first.')
    process.exit(1)
  }

  const failures = [
    ...checkJsChunk(indexJsName, 'index.js'),
    ...(appShellJsName ? checkJsChunk(appShellJsName, 'app-shell.js') : []),
  ]

  const indexHtmlPath = path.join(distDir, 'index.html')
  if (existsSync(indexHtmlPath)) {
    const indexHtml = readFileSync(indexHtmlPath, 'utf8')
    for (const pattern of FORBIDDEN_INDEX_STYLES) {
      const re = new RegExp(`href="/assets/${pattern}-[^"]+\\.css"`)
      if (re.test(indexHtml)) {
        failures.push(`index.html links blocking game CSS: ${pattern}`)
      }
    }
  }

  console.log('PlayMeet index chunk isolation check\n')
  if (failures.length) {
    console.error('Isolation failures:')
    failures.forEach((line) => console.error(`  ✗ ${line}`))
    process.exit(1)
  }

  console.log(`  OK ${indexJsName} — no game chunks on critical path`)
  if (appShellJsName) console.log(`  OK ${appShellJsName} — no game chunks on shell path`)
  console.log('  OK index.html — no game CSS on initial load')
}

main()
