/**
 * Faz 1 — PNG/JPEG → WebP + liste thumb'ları + video poster
 * Kullanım: node scripts/optimize-images.mjs
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const refDir = path.join(root, 'src/reference')
const optFull = path.join(refDir, 'opt/full')
const optThumb = path.join(refDir, 'opt/thumb')

const THUMB_WIDTH = 480
const THUMB_QUALITY = 78
const FULL_QUALITY = 82
const ICON_MAX = 320

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp'])

function walkImages(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'opt') continue
      out.push(...walkImages(full))
      continue
    }
    const ext = path.extname(entry.name).toLowerCase()
    if (IMAGE_EXT.has(ext) && ext !== '.webp') out.push(full)
  }
  return out
}

function safeBase(filePath) {
  return path.basename(filePath, path.extname(filePath))
}

async function optimizeImage(inputPath) {
  const base = safeBase(inputPath)
  const fullOut = path.join(optFull, `${base}.webp`)
  const thumbOut = path.join(optThumb, `${base}.webp`)

  const meta = await sharp(inputPath).metadata()
  const inputStat = fs.statSync(inputPath)

  await sharp(inputPath).webp({ quality: FULL_QUALITY, effort: 4 }).toFile(fullOut)

  const needsThumb =
    inputStat.size > 120_000 ||
    (meta.width ?? 0) > 640 ||
    ['brick', 'bubble', 'math', 'stack', 'oyun', '5', 'mor', 'galaxy', 'memory', 'block', 'xox', '3', '2'].includes(
      base,
    )

  if (needsThumb) {
    const thumbWidth = Math.min(THUMB_WIDTH, meta.width ?? THUMB_WIDTH)
    await sharp(inputPath)
      .resize(thumbWidth, null, { withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY, effort: 4 })
      .toFile(thumbOut)
  } else {
    const iconWidth = Math.min(ICON_MAX, meta.width ?? ICON_MAX)
    await sharp(inputPath)
      .resize(iconWidth, null, { withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toFile(thumbOut)
  }

  const fullSize = fs.statSync(fullOut).size
  const thumbSize = fs.statSync(thumbOut).size
  return { base, inputStat: inputStat.size, fullSize, thumbSize }
}

async function createVideoPoster() {
  const videoPath = path.join(refDir, 'video.mp4')
  const posterOut = path.join(optFull, 'video-poster.webp')
  if (!fs.existsSync(videoPath)) return

  try {
    const tmpPng = path.join(optFull, '_video-poster-frame.png')
    execSync(
      `ffmpeg -y -i "${videoPath}" -vframes 1 -q:v 2 "${tmpPng}"`,
      { stdio: 'pipe' },
    )
    await sharp(tmpPng)
      .resize(960, null, { withoutEnlargement: true })
      .webp({ quality: 72, effort: 4 })
      .toFile(posterOut)
    fs.unlinkSync(tmpPng)
    console.log('video poster:', posterOut)
  } catch {
    const fallback = path.join(refDir, 'galaxy.jpeg')
    if (fs.existsSync(fallback)) {
      await sharp(fallback)
        .resize(960, null, { withoutEnlargement: true })
        .blur(2)
        .webp({ quality: 70, effort: 4 })
        .toFile(posterOut)
      console.log('video poster (galaxy fallback):', posterOut)
    }
  }
}

fs.mkdirSync(optFull, { recursive: true })
fs.mkdirSync(optThumb, { recursive: true })

const images = walkImages(refDir)
const results = []

for (const file of images) {
  results.push(await optimizeImage(file))
}

await createVideoPoster()

results.sort((a, b) => b.inputStat - a.inputStat)
let saved = 0
for (const row of results) {
  saved += row.inputStat - row.fullSize
  console.log(
    `${row.base}: ${(row.inputStat / 1024).toFixed(0)}KB → full ${(row.fullSize / 1024).toFixed(0)}KB, thumb ${(row.thumbSize / 1024).toFixed(0)}KB`,
  )
}
console.log(`\nOptimized ${results.length} images. Approx saved vs full webp source: ${(saved / 1024 / 1024).toFixed(1)}MB`)
