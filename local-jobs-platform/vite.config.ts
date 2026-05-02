import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/local-job-portal/',
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  worker: {
    format: 'es'
  },
  esbuild: {
    drop: ['debugger'],
  },
  build: {
    // Code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'recharts'],
          'vendor-forms': ['react-hook-form', 'zustand'],
          'vendor-http': ['axios'],
          // PDF.js is lazy loaded, don't bundle it in vendor
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Minification
    minify: 'esbuild',
    // Source maps for debugging (but smaller)
    sourcemap: false,
  },
  // Performance optimizations
  server: {
    hmr: {
      overlay: false,
    },
  },
})
