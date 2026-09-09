import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed as a GitHub Pages project site at https://<user>.github.io/sight-reading/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/sight-reading/' : '/',
}))
