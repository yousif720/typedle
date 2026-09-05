/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // The generated Pokémon data is large but highly compressible; splitting it
    // out keeps the app chunk small and lets the data cache independently of
    // code changes.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/data/') && id.includes('generated')) {
            return 'pokemon-data'
          }

          if (id.includes('node_modules')) {
            return 'vendor'
          }

          return undefined
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'server/**/*.test.js'],
  },
})
