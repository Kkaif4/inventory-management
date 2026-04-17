import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    pool: 'forks',
    fileParallelism: false, // Integration tests share a real DB — run files sequentially
    env: loadEnv(mode, process.cwd(), ''),
    setupFiles: ['dotenv/config'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
}))
