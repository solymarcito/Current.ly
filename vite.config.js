import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Current.ly/',
  plugins: [react()],
  resolve: {
    alias: {
      'react-svg-worldmap': path.resolve(__dirname, 'node_modules/react-svg-worldmap/dist/index.js')
    }
  },
  optimizeDeps: {
    include: ['react-svg-worldmap']
  }
})

