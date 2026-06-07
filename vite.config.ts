import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'analyze' &&
      visualizer({
        filename: 'dist/bundle-stats.html',
        gzipSize: true,
        brotliSize: true,
        open: false,
      }),
  ].filter(Boolean),
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            if (
              id.includes('game1942DuelEngine') ||
              id.includes('game1942DuelFx') ||
              id.includes('game1942DuelBot')
            ) {
              return 'game-1942-engine'
            }
            if (
              id.includes('Game1942DuelPlay') ||
              id.includes('useGame1942Duel') ||
              id.includes('Game1942DuelArena') ||
              id.includes('game1942DuelRuntime')
            ) {
              return 'game-1942'
            }
            if (id.includes('Game1942') || id.includes('game1942')) {
              return 'game-1942-shell'
            }
            if (id.includes('SnakeDuel') || id.includes('snakeDuel') || id.includes('snake-duel')) {
              return 'game-snake'
            }
            if (id.includes('DefenderDuel') || id.includes('defenderDuel')) {
              return 'game-defender'
            }
            if (id.includes('BubbleShooter') || id.includes('bubbleShooter')) {
              return 'game-bubble'
            }
            if (id.includes('BlockDuel') || id.includes('blockEngine')) {
              return 'game-block'
            }
            if (id.includes('NeonCrush') || id.includes('neonCrush')) {
              return 'game-neon'
            }
            if (
              id.includes('useXoxRealtime') ||
              id.includes('XoxGameScreen') ||
              id.includes('xoxEngine') ||
              id.includes('xoxLogic')
            ) {
              return 'game-xox'
            }
            if (
              id.includes('/shared/useDocumentVisible') ||
              id.includes('/shared/useManagedTimeout') ||
              id.includes('/shared/useManagedTimers') ||
              id.includes('/shared/lazyNamed')
            ) {
              return 'shared-hooks'
            }
            if (id.includes('socket.io-client') || id.includes('gameSocketClient')) {
              return 'socket'
            }
            return undefined
          }

          if (id.includes('engine.io-client') || id.includes('socket.io-parser')) {
            return 'socket'
          }
          if (id.includes('framer-motion')) {
            return 'vendor-motion'
          }
          if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) {
            return 'vendor-react'
          }
          if (id.includes('react-icons')) {
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
