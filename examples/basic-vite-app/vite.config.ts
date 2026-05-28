import { readFileSync } from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
  const env = loadEnv(mode, process.cwd(), '')
  const contextPath = env.VITE_APP_CONTEXT_PATH?.trim() || '/'
  const normalizedPath = contextPath === '/' ? '' : contextPath.replace(/^\/+|\/+$/g, '')
  const base = normalizedPath ? `/${normalizedPath}/` : '/'
  const outDir = normalizedPath ? path.join('dist', normalizedPath) : 'dist'
  const appVersion = `v${packageJson.version}`

  return {
    base,
    plugins: [vue()],
    define: {
      __APP_VERSION__: JSON.stringify(appVersion)
    },
    build: {
      outDir
    }
  }
})
