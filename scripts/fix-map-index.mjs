/**
 * Restore map callback `index` param where body references it.
 * Restore usePrefersReducedMotion import where reduceMotion is used.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcRoot = path.join(__dirname, '..', 'src')

function walkSync(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkSync(full, out)
    else if (/\.tsx$/.test(entry.name)) out.push(full)
  }
  return out
}

function importPathFor(filePath) {
  let relPath = path.relative(path.dirname(filePath), path.join(srcRoot, 'shared', 'usePrefersReducedMotion.ts'))
  relPath = relPath.replace(/\\/g, '/').replace(/\.ts$/, '')
  if (!relPath.startsWith('.')) relPath = `./${relPath}`
  return relPath
}

function fixMapIndexParams(source) {
  const mapRe = /\.map\(\(([^)]*)\)\s*=>\s*\(/g
  let result = source
  let m
  const replacements = []

  while ((m = mapRe.exec(source)) !== null) {
    const params = m[1].trim()
    if (params.includes('index')) continue

    const arrowStart = m.index + m[0].length - 1
    let depth = 0
    let j = arrowStart
    for (; j < source.length; j++) {
      const ch = source[j]
      if (ch === '(') depth++
      else if (ch === ')') {
        depth--
        if (depth === 0) {
          j++
          break
        }
      }
    }
    const body = source.slice(arrowStart, j)
    if (!/\bindex\b/.test(body)) continue

    const newParams = params.length ? `${params}, index` : 'index'
    replacements.push({ start: m.index, end: m.index + m[0].length, text: `.map((${newParams}) => (` })
  }

  for (let i = replacements.length - 1; i >= 0; i--) {
    const r = replacements[i]
    result = result.slice(0, r.start) + r.text + result.slice(r.end)
  }
  return result
}

function ensureReducedMotionImport(source, filePath) {
  if (!/\breduceMotion\b/.test(source)) return source
  if (/usePrefersReducedMotion/.test(source)) return source
  const line = `import { usePrefersReducedMotion } from '${importPathFor(filePath)}'\n`
  const firstImport = source.search(/^import /m)
  if (firstImport >= 0) return source.slice(0, firstImport) + line + source.slice(firstImport)
  return line + source
}

function ensureReducedMotionHook(source) {
  if (!/\breduceMotion\b/.test(source)) return source
  if (/const reduceMotion = usePrefersReducedMotion\(\)/.test(source)) return source
  const firstImportEnd = source.indexOf('\n', source.search(/^import /m)) + 1
  return `${source.slice(0, firstImportEnd)}\nconst reduceMotion = usePrefersReducedMotion()\n${source.slice(firstImportEnd)}`
}

// Don't inject hook at module level - only inside components. Skip ensureReducedMotionHook.

function fixFile(filePath) {
  let src = readFileSync(filePath, 'utf8')
  const before = src
  src = fixMapIndexParams(src)
  if (/\breduceMotion\b/.test(src) && !/const reduceMotion = usePrefersReducedMotion\(\)/.test(src)) {
    // reduceMotion used but hook removed - need to read file and add hook inside component
  }
  src = ensureReducedMotionImport(src, filePath)
  if (src !== before) writeFileSync(filePath, src, 'utf8')
  return src !== before
}

let count = 0
for (const file of walkSync(srcRoot)) {
  if (fixFile(file)) count++
}
console.log(`Fixed map index in ${count} files.`)
