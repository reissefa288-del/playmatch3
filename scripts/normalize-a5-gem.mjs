/**
 * a5.png dikey (575×1280) — diğer taşlarla aynı 500×500 kare kanvas + optik boyut.
 * Kullanım: node scripts/normalize-a5-gem.mjs
 */
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const TARGET = 500
const GEM_FILL = 0.88

const inputPath = path.join(root, 'src/reference/a5.png')
const outputPath = inputPath

const trimmed = sharp(inputPath).trim({ threshold: 12 })
const { data, info } = await trimmed.png().toBuffer({ resolveWithObject: true })

const maxSide = Math.max(info.width, info.height)
const scale = (TARGET * GEM_FILL) / maxSide
const w = Math.max(1, Math.round(info.width * scale))
const h = Math.max(1, Math.round(info.height * scale))

const padX = Math.max(0, Math.floor((TARGET - w) / 2))
const padY = Math.max(0, Math.floor((TARGET - h) / 2))

await sharp(data)
  .resize(w, h, { kernel: sharp.kernel.lanczos3 })
  .extend({
    top: padY,
    bottom: TARGET - h - padY,
    left: padX,
    right: TARGET - w - padX,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png({ compressionLevel: 9, quality: 100 })
  .toFile(outputPath)

const outMeta = await sharp(outputPath).metadata()
console.log(`a5 normalized: ${info.width}x${info.height} (trim) -> ${outMeta.width}x${outMeta.height}`)
