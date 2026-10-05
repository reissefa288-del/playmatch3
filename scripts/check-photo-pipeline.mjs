/**
 * P12 — photo pipeline (thumb/full/blur, srcset, CDN env) wired for API swap.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const pipelineFile = path.join(root, 'src', 'shared', 'photoPipeline.ts')
const photoImageFile = path.join(root, 'src', 'shared', 'PhotoImage.tsx')
const fakePortraitsFile = path.join(root, 'src', 'shared', 'fakePortraits.ts')
const gameArtFile = path.join(root, 'src', 'features', 'games', 'gameArtImages.ts')
const envExample = path.join(root, '.env.example')
const budgetsFile = path.join(root, 'performance', 'budgets.json')

const PORTRAIT_BLUR = ['kız', 'erkek']
const errors = []

if (!existsSync(pipelineFile)) {
  errors.push('Missing src/shared/photoPipeline.ts')
} else {
  const src = readFileSync(pipelineFile, 'utf8')
  if (!/photoSetSrcSets/.test(src)) errors.push('photoPipeline must export photoSetSrcSets')
  if (!/photoSetFromApi/.test(src)) errors.push('photoPipeline must export photoSetFromApi for CDN/API')
  if (!/VITE_CDN_BASE_URL/.test(src)) errors.push('photoPipeline must read VITE_CDN_BASE_URL')
}

if (!existsSync(photoImageFile)) {
  errors.push('Missing src/shared/PhotoImage.tsx')
} else {
  const src = readFileSync(photoImageFile, 'utf8')
  if (!/srcSet/.test(src)) errors.push('PhotoImage must render responsive srcSet')
  if (!/blurSrc|pm-photo/.test(src)) errors.push('PhotoImage must support blur placeholder')
}

if (!existsSync(fakePortraitsFile) || !/fakePhotoSetForGender/.test(readFileSync(fakePortraitsFile, 'utf8'))) {
  errors.push('fakePortraits must export fakePhotoSetForGender (PhotoSet)')
}

if (!existsSync(gameArtFile) || !/gameArtPhotoSet/.test(readFileSync(gameArtFile, 'utf8'))) {
  errors.push('gameArtImages must export gameArtPhotoSet')
}

if (!existsSync(envExample) || !/VITE_CDN_BASE_URL/.test(readFileSync(envExample, 'utf8'))) {
  errors.push('.env.example must document VITE_CDN_BASE_URL')
}

try {
  const budgets = JSON.parse(readFileSync(budgetsFile, 'utf8'))
  if (!budgets.photo?.maxBlurKb) {
    errors.push('performance/budgets.json photo.maxBlurKb missing')
  }
} catch {
  errors.push('performance/budgets.json photo section missing')
}

for (const base of PORTRAIT_BLUR) {
  const blurPath = path.join(root, 'src', 'reference', 'opt', 'blur', `${base}.webp`)
  if (!existsSync(blurPath)) {
    errors.push(`Missing src/reference/opt/blur/${base}.webp — run npm run optimize:images`)
    continue
  }
  const kb = readFileSync(blurPath).length / 1024
  const maxKb = JSON.parse(readFileSync(budgetsFile, 'utf8')).photo?.maxBlurKb ?? 2
  if (kb > maxKb) {
    errors.push(`blur/${base}.webp ${kb.toFixed(1)} KB exceeds photo.maxBlurKb ${maxKb}`)
  }
}

if (errors.length) {
  console.error('Photo pipeline check failed:\n')
  errors.forEach((line) => console.error(`  • ${line}`))
  process.exit(1)
}

console.log('Photo pipeline check passed (srcset, blur, CDN hook, portrait PhotoSet).')
