/**
 * Post-framer cleanup: motion.i, layout prop, unused reduceMotion/index.
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

function cleanup(content) {
  let out = content
  out = out.replace(/<motion\.i/g, '<i')
  out = out.replace(/\s+layout(?:=\{[^}]*\}|(?=\s|>|\/))/g, '')
  out = out.replace(
    /^[ \t]*const reduceMotion = usePrefersReducedMotion\(\)\n/gm,
    '',
  )
  out = out.replace(
    /^import \{ usePrefersReducedMotion \} from '[^']+'\n(?![\s\S]*usePrefersReducedMotion)/gm,
    '',
  )
  out = out.replace(/,\s*index\s*(?=\))/g, '')
  out = out.replace(/\(\s*index\s*\)\s*=>/g, '() =>')
  out = out.replace(/\(\s*(\w+)\s*,\s*index\s*\)\s*=>/g, '($1) =>')
  out = out.replace(/\(\s*_index\s*\)\s*=>/g, '() =>')
  return out
}

let count = 0
for (const file of walkSync(srcRoot)) {
  const before = readFileSync(file, 'utf8')
  const after = cleanup(before)
  if (after !== before) {
    writeFileSync(file, after, 'utf8')
    count++
  }
}
console.log(`Cleaned ${count} files.`)
