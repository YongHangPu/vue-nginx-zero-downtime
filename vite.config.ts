import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const isGithubPages = process.env.GITHUB_ACTIONS === 'true'
const repoBase = '/vue-nginx-zero-downtime/'

// https://vite.dev/config/
export default defineConfig({
  base: isGithubPages ? repoBase : '/',
  plugins: [vue()],
})
