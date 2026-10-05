/**
 * Add usePrefersReducedMotion hook where reduceMotion is referenced.
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

function fixReduceMotion(source, filePath) {
  if (!/\breduceMotion\b/.test(source)) return source
  let out = source

  if (!out.includes('usePrefersReducedMotion')) {
    const line = `import { usePrefersReducedMotion } from '${importPathFor(filePath)}'\n`
    const firstImport = out.search(/^import /m)
    out = firstImport >= 0 ? out.slice(0, firstImport) + line + out.slice(firstImport) : line + out
  }

  if (!/const reduceMotion = usePrefersReducedMotion\(\)/.test(out)) {
    out = out.replace(
      /(\)\s*\{\s*\n)(\s*(?:const|let|var)\s)/,
      '$1  const reduceMotion = usePrefersReducedMotion()\n$2',
    )
    if (!/const reduceMotion = usePrefersReducedMotion\(\)/.test(out)) {
      out = out.replace(
        /(function \w+[^{]*\{\s*\n)/,
        '$1  const reduceMotion = usePrefersReducedMotion()\n',
      )
    }
  }
  return out
}

function fixMapIndexInFile(source) {
  return source.replace(/\.map\(\(([\w$]+)\)\s*=>/g, (match, param) => {
    const start = source.indexOf(match)
    if (start === -1) return match
    const after = source.slice(start, start + 800)
    if (!/\bindex\b/.test(after.slice(match.length))) return match
    if (match.includes('index')) return match
    return `.map((${param}, index) =>`
  })
}

let count = 0
for (const file of walkSync(srcRoot)) {
  let src = readFileSync(file, 'utf8')
  const before = src
  src = fixReduceMotion(src, file)
  src = fixMapIndexInFile(src)
  if (src !== before) {
    writeFileSync(file, src, 'utf8')
    count++
  }
}
console.log(`Patched ${count} files.`)
