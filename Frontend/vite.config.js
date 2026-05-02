import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      // Any request to /api/* is forwarded to the backend
      // This means the frontend NEVER calls localhost:5000 directly —
      // it calls its own port and Vite forwards it. Works on any machine.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})