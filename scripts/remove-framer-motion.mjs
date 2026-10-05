/**
 * Removes framer-motion imports and converts motion.* to plain elements.
 * Strips motion-only JSX props. Run: node scripts/remove-framer-motion.mjs
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcRoot = path.join(__dirname, '..', 'src')

const MOTION_TAGS = [
  'div',
  'span',
  'button',
  'section',
  'article',
  'p',
  'ul',
  'li',
  'img',
  'strong',
  'header',
  'footer',
  'nav',
  'main',
  'aside',
  'form',
  'label',
  'h1',
  'h2',
  'h3',
  'h4',
  'svg',
  'path',
  'circle',
]

const MOTION_PROPS = [
  'initial',
  'animate',
  'exit',
  'transition',
  'whileTap',
  'whileHover',
  'whileFocus',
  'whileInView',
  'viewport',
  'layout',
  'layoutId',
  'layoutRoot',
  'variants',
  'custom',
  'drag',
  'dragConstraints',
  'dragElastic',
  'dragMomentum',
  'onAnimationComplete',
  'onDragEnd',
  'onUpdate',
]

function walkSync(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkSync(full, out)
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(full)
  }
  return out
}

function removeJsxProp(source, propName) {
  let result = source
  const needle = new RegExp(`\\s${propName}=`, 'g')
  let match
  while ((match = needle.exec(result)) !== null) {
    const start = match.index
    const eq = result.indexOf('=', start)
    if (eq === -1) break
    let i = eq + 1
    while (i < result.length && /\s/.test(result[i])) i++
    if (result[i] === '{') {
      let depth = 0
      let j = i
      for (; j < result.length; j++) {
        const ch = result[j]
        if (ch === '{') depth++
        else if (ch === '}') {
          depth--
          if (depth === 0) {
            j++
            break
          }
        }
      }
      result = result.slice(0, start) + result.slice(j)
      needle.lastIndex = start
    } else if (result[i] === '"' || result[i] === "'") {
      const quote = result[i]
      let j = i + 1
      while (j < result.length && result[j] !== quote) j++
      j++
      result = result.slice(0, start) + result.slice(j)
      needle.lastIndex = start
    } else {
      let j = i
      while (j < result.length && !/[\s/>]/.test(result[j])) j++
      result = result.slice(0, start) + result.slice(j)
      needle.lastIndex = start
    }
  }
  return result
}

function stripAllMotionProps(source) {
  let out = source
  for (const prop of MOTION_PROPS) {
    out = removeJsxProp(out, prop)
  }
  return out
}

function transformFile(filePath) {
  let src = readFileSync(filePath, 'utf8')
  if (!src.includes('framer-motion')) return false

  const hadReducedMotion = /\buseReducedMotion\b/.test(src)

  src = src.replace(/^import\s+type\s+\{[^}]+\}\s+from\s+['"]framer-motion['"];?\s*\n/gm, '')
  src = src.replace(/^import\s+\{[^}]+\}\s+from\s+['"]framer-motion['"];?\s*\n/gm, '')

  for (const tag of MOTION_TAGS) {
    src = src.replaceAll(`motion.${tag}`, tag)
  }

  src = src.replace(/<AnimatePresence[^>]*>/g, '<>')
  src = src.replace(/<\/AnimatePresence>/g, '</>')
  src = src.replace(/<LayoutGroup[^>]*>/g, '<>')
  src = src.replace(/<\/LayoutGroup>/g, '</>')

  src = stripAllMotionProps(src)

  if (hadReducedMotion) {
    src = src.replace(/\buseReducedMotion\b/g, 'usePrefersReducedMotion')
    if (!src.includes('usePrefersReducedMotion')) {
      let relPath = path.relative(path.dirname(filePath), path.join(srcRoot, 'shared', 'usePrefersReducedMotion.ts'))
      relPath = relPath.replace(/\\/g, '/').replace(/\.ts$/, '')
      if (!relPath.startsWith('.')) relPath = `./${relPath}`
      const line = `import { usePrefersReducedMotion } from '${relPath}'\n`
      const firstImport = src.search(/^import /m)
      if (firstImport >= 0) {
        src = src.slice(0, firstImport) + line + src.slice(firstImport)
      } else {
        src = line + src
      }
    }
  }

  writeFileSync(filePath, src, 'utf8')
  return true
}

const files = walkSync(srcRoot)
let count = 0
for (const file of files) {
  if (transformFile(file)) count++
}
console.log(`Transformed ${count} files.`)
