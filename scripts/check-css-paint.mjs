/**
 * Faz H — CSS & paint guards (CI).
 *
 * - Tab bundles: one CSS entry per main dock tab
 * - No persistent will-change on tab panels / stack shell
 * - No transform on tab panels (breaks fixed atmosphere layers)
 * - content-visibility on long nearby + chat lists
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8')
}

function stripMediaQueries(css) {
  let result = ''
  let i = 0
  while (i < css.length) {
    const mediaIdx = css.indexOf('@media', i)
    if (mediaIdx === -1) {
      result += css.slice(i)
      break
    }
    result += css.slice(i, mediaIdx)
    let j = mediaIdx
    let depth = 0
    let started = false
    while (j < css.length) {
      const char = css[j]
      if (char === '{') {
        depth += 1
        started = true
      } else if (char === '}') {
        depth -= 1
        if (started && depth === 0) {
          j += 1
          break
        }
      }
      j += 1
    }
    i = j
  }
  return result
}

const errors = []

const tabBundles = [
  { file: 'src/styles/home-body.css', screen: 'src/features/home/HomeScreenBody.tsx', shellCss: 'src/styles/home-hero.css', shellScreen: 'src/features/home/HomeScreenShell.tsx' },
  { file: 'src/styles/match-bundle.css', screen: 'src/features/match/MatchScreenBody.tsx', shellCss: 'src/styles/match-bundle.css', shellScreen: 'src/features/match/MatchScreenShell.tsx' },
  {
    file: 'src/styles/games-bundle.css',
    screen: 'src/features/games/GamesScreenBody.tsx',
    shellCss: 'src/styles/games-hero.css',
    shellScreen: 'src/features/games/GamesScreenShell.tsx',
  },
  { file: 'src/styles/chat-bundle.css', screen: 'src/features/chat/ChatScreen.tsx' },
  {
    file: 'src/styles/profile-bundle.css',
    screen: 'src/features/profile/ProfileScreenBody.tsx',
    shellCss: 'src/styles/profile-bundle.css',
    shellScreen: 'src/features/profile/ProfileScreenShell.tsx',
  },
]

for (const entry of tabBundles) {
  const { file, screen } = entry
  if (!fs.existsSync(path.join(root, file))) {
    errors.push(`Missing tab bundle: ${file}`)
    continue
  }
  const screenSrc = read(screen)
  const bundleName = path.basename(file)
  if (!screenSrc.includes(bundleName)) {
    errors.push(`${screen} must import ${bundleName} (single CSS entry)`)
  }
  if (entry.shellCss && entry.shellScreen) {
    if (!fs.existsSync(path.join(root, entry.shellCss))) {
      errors.push(`Missing games shell CSS: ${entry.shellCss}`)
    } else {
      const shellSrc = read(entry.shellScreen)
      const shellName = path.basename(entry.shellCss)
      if (!shellSrc.includes(shellName)) {
        errors.push(`${entry.shellScreen} must import ${shellName} (LCP shell CSS)`)
      }
    }
  }
}

const navigationCss = stripMediaQueries(read('src/styles/navigation.css'))

if (/\.pm-tab-panel\s*\{[^}]*will-change\s*:(?![^;]*auto)/s.test(navigationCss)) {
  errors.push('navigation.css: remove persistent will-change from .pm-tab-panel')
}

if (/\.pm-stack-overlay\s*\{[^}]*will-change\s*:(?![^;]*auto)/s.test(navigationCss)) {
  errors.push('navigation.css: scope will-change to .pm-stack-overlay-enter only')
}

if (/\.pm-tab-panel[^}]*\btransform\s*:/s.test(navigationCss)) {
  errors.push('navigation.css: .pm-tab-panel must not use transform (fixed atmosphere layers)')
}

const paintTargets = [
  { file: 'src/styles/home.css', selector: '.pm-nearby-card' },
  { file: 'src/styles/home-nearby-sheet.css', selector: '.pm-nearby-list-card' },
  { file: 'src/styles/chat.css', selector: '.pm-chat-item' },
]

for (const { file, selector } of paintTargets) {
  const css = read(file)
  const blockRe = new RegExp(`${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`, 's')
  const match = css.match(blockRe)
  if (!match || !/content-visibility\s*:\s*auto/.test(match[1])) {
    errors.push(`${file}: ${selector} needs content-visibility: auto`)
  }
}

const tabScopedWillChange = [
  'src/styles/navigation.css',
  'src/styles/home-ambient.css',
  'src/styles/games.css',
  'src/styles/match.css',
  'src/styles/chat.css',
]

for (const rel of tabScopedWillChange) {
  const css = stripMediaQueries(read(rel))
  if (!/will-change\s*:/.test(css)) continue
  const lines = css.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (!/will-change\s*:/.test(lines[i]) || /will-change\s*:\s*auto/.test(lines[i])) continue
    const context = lines.slice(Math.max(0, i - 3), i + 2).join('\n')
    if (/\.pm-tab-panel|\.pm-stack-overlay[^-]|\.pm-ambient-orb|\.pm-games-featured-track|\.pm-match-hero-card|\.pm-chat-list__row/.test(context)) {
      errors.push(`${rel}:${i + 1} persistent will-change on tab paint target — scope to motion class or remove`)
    }
  }
}

if (read('src/features/games/components/GameInviteSheet.tsx').includes('games-invite-sheet.css')) {
  errors.push('GameInviteSheet.tsx: invite sheet CSS belongs in games-bundle.css')
}

if (errors.length) {
  console.error('CSS paint check failed:\n')
  for (const message of errors) {
    console.error(`  • ${message}`)
  }
  process.exit(1)
}

console.log('CSS paint check passed (tab bundles, will-change, content-visibility).')
