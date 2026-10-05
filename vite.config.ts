import { createReadStream, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { injectCriticalPreloads } from './vite/injectCriticalPreloads'
import { generateServiceWorker } from './vite/generateServiceWorker'

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist')
const packageJson = JSON.parse(
  readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'package.json'), 'utf8'),
) as { version?: string }
const appRelease = process.env.VITE_APP_RELEASE?.trim() || `playmeet@${packageJson.version ?? '0.0.0'}`

function cacheControlFor(urlPath: string) {
  if (urlPath.includes('/assets/') || /\.(js|css|woff2|webp|avif|svg|png|jpg|mp4|webm|br)$/i.test(urlPath)) {
    return 'public, max-age=31536000, immutable'
  }
  return 'public, max-age=0, must-revalidate'
}

function mimeFor(filePath: string) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8'
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8'
  if (filePath.endsWith('.webp')) return 'image/webp'
  if (filePath.endsWith('.avif')) return 'image/avif'
  if (filePath.endsWith('.woff2')) return 'font/woff2'
  if (filePath.endsWith('.json')) return 'application/json'
  if (filePath.endsWith('.svg')) return 'image/svg+xml'
  return 'application/octet-stream'
}

function resolveDistAsset(urlPath: string, acceptEncoding: string) {
  const decoded = decodeURIComponent(urlPath.split('?')[0] ?? '/')
  let filePath = path.join(distDir, decoded === '/' ? 'index.html' : decoded)
  if (!existsSync(filePath)) {
    filePath = path.join(distDir, 'index.html')
  }

  const acceptsBrotli = /\bbr\b/i.test(acceptEncoding)
  const brotliPath = `${filePath}.br`
  if (acceptsBrotli && !filePath.endsWith('.br') && existsSync(brotliPath)) {
    return { filePath: brotliPath, contentType: mimeFor(filePath), encoding: 'br' as const }
  }

  return { filePath, contentType: mimeFor(filePath), encoding: null }
}

function brotliStaticPreview(): Plugin {
  return {
    name: 'brotli-static-preview',
    apply: 'serve',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/')
        const acceptEncoding = req.headers['accept-encoding'] ?? ''
        if (!/\bbr\b/i.test(acceptEncoding)) return next()
        if (!urlPath.includes('/assets/') && !/\.(js|css|html|svg|json)$/i.test(urlPath)) return next()

        const { filePath, contentType, encoding } = resolveDistAsset(urlPath, acceptEncoding)
        if (!encoding || !existsSync(filePath)) return next()

        res.setHeader('Cache-Control', cacheControlFor(urlPath))
        res.setHeader('Content-Type', contentType)
        res.setHeader('Content-Encoding', encoding)
        createReadStream(filePath).pipe(res)
      })
      applyCacheHeaders(server.middlewares)
    },
  }
}

function applyCacheHeaders(middleware: { use: (fn: (req: import('http').IncomingMessage, res: import('http').ServerResponse, next: () => void) => void) => void }) {
  middleware.use((req, res, next) => {
    const url = req.url?.split('?')[0] ?? ''
    res.setHeader('Cache-Control', cacheControlFor(url))
    next()
  })
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    'import.meta.env.VITE_APP_RELEASE': JSON.stringify(appRelease),
  },
  plugins: [
    react(),
    injectCriticalPreloads(),
    generateServiceWorker(),
    brotliStaticPreview(),
    mode === 'analyze' &&
      visualizer({
        filename: 'dist/bundle-stats.html',
        gzipSize: true,
        brotliSize: true,
        open: false,
      }),
  ].filter(Boolean),
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const path = id.replace(/\\/g, '/')
          if (!path.includes('node_modules')) {
            // P0: app shell shared modules — must precede game-* rules so providers/UI
            // never land in game chunks and poison the index critical path.
            if (
              path.includes('/shared/uiImages') ||
              path.includes('/shared/LazyImage') ||
              path.includes('/shared/PictureImage') ||
              path.includes('/shared/PhotoImage') ||
              path.includes('/shared/photoPipeline') ||
              path.includes('/shared/photo-image.css') ||
              path.includes('/shared/LcpImagePreload') ||
              path.includes('/shared/fakePortraits') ||
              path.includes('/shared/formatGemBalance') ||
              path.includes('/shared/canvasDpr') ||
              path.includes('/shared/releaseCanvas') ||
              path.includes('/features/games/components/GamePlayerPortrait') ||
              path.includes('/features/home/components/Navbar') ||
              path.includes('/features/home/components/AmbientParticles')
            ) {
              return 'shared-ui'
            }
            if (
              path.includes('/shared/usePrefersReducedMotion')
            ) {
              return 'shared-hooks'
            }
            // P5 — Home LCP shell (preloaded; not in app-shell) — before games-shell for shared Navbar
            if (
              path.includes('/features/home/HomeScreenShell') ||
              path.includes('/features/home/homeLcpPortrait') ||
              path.includes('/styles/home-hero.css')
            ) {
              return 'home-shell'
            }
            // P7 — Profile LCP shell (preloaded; not in app-shell)
            if (
              path.includes('/features/profile/ProfileScreenShell') ||
              path.includes('/features/profile/profileLcpPortrait')
            ) {
              return 'profile-shell'
            }
            // P1/P6 — Games LCP shell (preloaded; not in app-shell)
            if (
              path.includes('/features/games/GamesTabEntry') ||
              path.includes('/features/games/GamesScreenShell') ||
              path.includes('/features/games/gamesLcpArt') ||
              path.includes('/features/games/gamesShellTheme') ||
              path.includes('/styles/games-hero.css')
            ) {
              return 'games-shell'
            }
            // P8 — Match LCP shell (preloaded; not in app-shell)
            if (
              path.includes('/features/match/MatchScreenShell') ||
              path.includes('/features/match/matchLcpPortrait')
            ) {
              return 'match-shell'
            }
            if (
              path.includes('/features/profile/ProfileLevelProvider') ||
              path.includes('/features/profile/profileLevel') ||
              path.includes('/features/currency/GemBalanceProvider') ||
              path.includes('/features/currency/gemBalanceStore') ||
              path.includes('/features/home/NearbyLikesProvider') ||
              path.includes('/features/likes/DailyLikesProvider') ||
              path.includes('/features/likes/useDailyLikes') ||
              path.includes('/features/games/GameMatchedInvitesProvider')
            ) {
              return 'app-providers'
            }
            if (
              path.includes('/navigation/') ||
              path.includes('/features/auth/authSession') ||
              path.includes('/features/auth/useAuthSession') ||
              path.includes('/features/onboarding/onboardingProfile') ||
              path.includes('/features/onboarding/useUserProfile') ||
              path.includes('/features/home/bottomNavigation') ||
              path.includes('/features/home/components/BottomNavigation') ||
              path.includes('/features/games/components/GameRouteFallback')
            ) {
              return 'app-shell'
            }
            if (
              path.includes('/shared/useDocumentVisible') ||
              path.includes('/shared/useManagedTimeout') ||
              path.includes('/shared/useManagedTimers') ||
              path.includes('/shared/lazyNamed')
            ) {
              return 'shared-hooks'
            }
            if (
              path.includes('/features/games/') &&
              (path.includes('game1942DuelEngine') ||
                path.includes('game1942DuelFx') ||
                path.includes('game1942DuelBot'))
            ) {
              return 'game-1942-engine'
            }
            if (path.includes('/features/games/') && path.includes('Game1942DuelArena')) {
              return 'game-1942-arena'
            }
            if (
              path.includes('/features/games/') &&
              (path.includes('Game1942DuelPlay') ||
                path.includes('useGame1942Duel') ||
                path.includes('game1942DuelRuntime'))
            ) {
              return 'game-1942'
            }
            if (path.includes('/features/games/') && (path.includes('Game1942') || path.includes('game1942'))) {
              return 'game-1942-shell'
            }
            if (
              path.includes('/features/games/') &&
              (path.includes('SnakeDuel') || path.includes('snakeDuel') || path.includes('snake-duel'))
            ) {
              return 'game-snake'
            }
            if (path.includes('/features/games/') && (path.includes('DefenderDuel') || path.includes('defenderDuel'))) {
              return 'game-defender'
            }
            if (path.includes('/features/games/') && (path.includes('BubbleShooter') || path.includes('bubbleShooter'))) {
              return 'game-bubble'
            }
            if (
              path.includes('/features/games/') &&
              (path.includes('BlockDuelScreen') ||
                path.includes('BlockBoardCanvas') ||
                path.includes('/utils/blockEngine') ||
                path.includes('useBlockDuel') ||
                path.includes('blockSounds') ||
                path.includes('blockBot'))
            ) {
              return 'game-block'
            }
            if (path.includes('/features/games/') && (path.includes('NeonCrush') || path.includes('neonCrush'))) {
              return 'game-neon'
            }
            if (
              path.includes('/features/games/') &&
              (path.includes('useXoxRealtime') ||
                path.includes('XoxGameScreen') ||
                path.includes('xoxEngine') ||
                path.includes('xoxLogic') ||
                path.includes('xoxSounds'))
            ) {
              return 'game-xox'
            }
            if (path.includes('/features/notifications/')) {
              return 'tab-notifications'
            }
            if (path.includes('/features/currency/')) {
              return 'tab-currency'
            }
            if (path.includes('/features/legal/') && path.includes('LegalDocumentBody')) {
              return 'tab-legal'
            }
            return undefined
          }

          if (id.includes('engine.io-client') || id.includes('socket.io-parser') || id.includes('socket.io-client')) {
            return 'socket'
          }
          if (path.includes('@sentry')) {
            return 'vendor-sentry'
          }
          if (path.includes('react-icons/fi')) {
            return 'vendor-icons-fi'
          }
          if (path.includes('react-icons/io5')) {
            return 'vendor-icons-io5'
          }
          if (path.includes('react-icons/lu')) {
            return 'vendor-icons-lu'
          }
          if (path.includes('react-icons/pi')) {
            return 'vendor-icons-pi'
          }
          if (path.includes('react-icons/md')) {
            return 'vendor-icons-md'
          }
          if (path.includes('react-router') || path.includes('react-dom') || path.includes('/react/')) {
            return 'vendor-react'
          }
          if (path.includes('react-icons')) {
            return 'vendor-icons'
          }
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/game-server': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/game-server/, ''),
      },
    },
  },
}))
