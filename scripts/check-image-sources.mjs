/**
 * Faz E4 — kaynak rasterların optimize edilmiş karşılığı var mı + kodda ham import yok mu.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const refDir = path.join(root, 'src', 'reference')
const srcDir = path.join(root, 'src')
const RAW_EXT = new Set(['.png', '.jpg', '.jpeg'])

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'opt') continue
      walk(full, out)
      continue
    }
    out.push(full)
  }
  return out
}

function walkCode(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue
      walkCode(full, out)
      continue
    }
    if (/\.(tsx?|jsx?|css)$/.test(entry.name)) out.push(full)
  }
  return out
}

function safeBase(filePath) {
  return path.basename(filePath, path.extname(filePath))
}

const failures = []

for (const file of walk(refDir)) {
  const ext = path.extname(file).toLowerCase()
  if (!RAW_EXT.has(ext)) continue
  const base = safeBase(file)
  const webp = path.join(refDir, 'opt', 'full', `${base}.webp`)
  if (!fs.existsSync(webp)) {
    failures.push(`Missing opt/full/${base}.webp for src/reference/${path.relative(refDir, file).replace(/\\/g, '/')} — run npm run optimize:images`)
  }
}

const importPattern = /from\s+['"][^'"]+\.(png|jpe?g)['"]|import\s+['"][^'"]+\.(png|jpe?g)['"]/gi
for (const file of walkCode(srcDir)) {
  const text = fs.readFileSync(file, 'utf8')
  if (importPattern.test(text)) {
    failures.push(`Direct raster import in ${path.relative(root, file).replace(/\\/g, '/')} — use src/reference/opt/*.webp`)
  }
}

const videoMaster = path.join(refDir, 'video.mp4')
const videoOptWebm = path.join(refDir, 'opt/video/duel-bg.webm')
const videoOptMp4 = path.join(refDir, 'opt/video/duel-bg.mp4')
if (fs.existsSync(videoMaster) && !fs.existsSync(videoOptWebm) && !fs.existsSync(videoOptMp4)) {
  failures.push('Missing optimized duel video — run npm run optimize:video')
}

console.log('PlayMeet image source check\n')
if (failures.length) {
  failures.forEach((line) => console.error(`  ✗ ${line}`))
  process.exit(1)
}
console.log('  OK — master rasters have opt/full webp counterparts')
console.log('  OK — no direct raster imports in src/')
console.log('  OK — optimized duel video present when master exists')
