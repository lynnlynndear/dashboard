import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// VITE_BASE_URL is set by CI to /<repo-name>/ for GitHub Pages.
// Falls back to '/' for local development.
const base = process.env.VITE_BASE_URL ?? '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        cvp: 'index-cvp.html',
      },
    },
  },
})
