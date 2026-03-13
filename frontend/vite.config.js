import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3300
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@chakra-ui') || id.includes('@emotion') || id.includes('framer-motion')) {
              return 'ui-vendor';
            }
            if (id.includes('pdfjs-dist') || id.includes('mammoth')) {
              return 'document-vendor';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
