import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('SnakeDuel') ||
            id.includes('snakeDuel') ||
            id.includes('snake-duel') ||
            id.includes('snakeDuelEngine')
          ) {
            return 'snake-duel'
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
})
