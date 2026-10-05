/**
 * Faz E — dist asset boyutları (video lazy + optimize görseller).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const distDir = path.join(root, 'dist')
const budgetsFile = path.join(root, 'performance', 'budgets.json')

function readBudgets() {
  return JSON.parse(readFileSync(budgetsFile, 'utf8'))
}

function walkFiles(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkFiles(full, out)
    else out.push(full)
  }
  return out
}

function bucket(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (/\.(mp4|webm)$/i.test(ext)) return 'video'
  if (/\.(webp|avif|png|jpe?g|svg|gif|ico)$/i.test(ext)) return 'image'
  if (/\.(js|css|woff2?|ttf|html)$/i.test(ext)) return 'code'
  return 'other'
}

function main() {
  if (!existsSync(distDir)) {
    console.error('dist/ not found — run `npm run build` first.')
    process.exit(1)
  }

  const media = readBudgets().media ?? {}
  const maxVideoMb = media.maxVideoFileMb ?? 2
  const maxImageMb = media.maxDistImageAssetsMb ?? 5.5
  const maxCodeMb = media.maxDistCodeAssetsMb ?? 1.5
  const maxStaticMb = media.maxDistAssetsMbExcludingVideo ?? 7

  const totals = { video: 0, image: 0, code: 0, other: 0 }
  const failures = []
  const notes = []

  for (const file of walkFiles(distDir)) {
    const rel = path.relative(distDir, file).replace(/\\/g, '/')
    if (rel.endsWith('.br')) continue
    const bytes = statSync(file).size
    if (rel.includes('vendor-sentry')) continue
    const kind = bucket(file)
    totals[kind] += bytes

    if (kind === 'video') {
      const mb = bytes / 1024 / 1024
      if (mb > maxVideoMb) {
        failures.push(`${rel}: ${mb.toFixed(2)} MB exceeds ${maxVideoMb} MB video budget`)
      } else {
        notes.push(`OK video ${rel}: ${mb.toFixed(2)} MB`)
      }
    }
  }

  const imageMb = totals.image / 1024 / 1024
  const codeMb = totals.code / 1024 / 1024
  const staticMb = (totals.image + totals.code + totals.other) / 1024 / 1024

  if (imageMb > maxImageMb) {
    failures.push(`Image assets ${imageMb.toFixed(2)} MB exceed ${maxImageMb} MB`)
  } else {
    notes.push(`OK image assets: ${imageMb.toFixed(2)} MB / ${maxImageMb} MB`)
  }

  if (codeMb > maxCodeMb) {
    failures.push(`JS/CSS/font assets ${codeMb.toFixed(2)} MB exceed ${maxCodeMb} MB`)
  } else {
    notes.push(`OK code assets: ${codeMb.toFixed(2)} MB / ${maxCodeMb} MB`)
  }

  if (staticMb > maxStaticMb) {
    failures.push(`Static dist assets ${staticMb.toFixed(2)} MB exceed ${maxStaticMb} MB (excluding video)`)
  } else {
    notes.push(`OK static dist assets: ${staticMb.toFixed(2)} MB / ${maxStaticMb} MB`)
  }

  console.log('PlayMeet media budget check\n')
  notes.forEach((line) => console.log(`  ${line}`))

  if (failures.length) {
    console.error('\nMedia budget failures:')
    failures.forEach((line) => console.error(`  ✗ ${line}`))
    process.exit(1)
  }

  console.log('\nAll media budgets passed.')
}

main()
