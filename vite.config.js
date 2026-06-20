import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Required for SockJS / StompJS which reference the global object
  define: {
    global: 'window',
  },

  // Dev server with API proxy
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },

  // Production build settings
  build: {
    // Source maps only in CI/staging — disable to shrink bundle for production
    sourcemap: false,
    // Warn on chunks > 1 MB
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        // Split heavy vendor libs into separate cacheable chunks
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@monaco-editor') || id.includes('monaco-editor')) return 'monaco-vendor'
            if (id.includes('@stomp') || id.includes('sockjs-client'))          return 'stomp-vendor'
            if (id.includes('lucide-react'))                                    return 'icons-vendor'
            if (id.includes('react-dom') || id.includes('react-router'))        return 'react-vendor'
            if (id.includes('react'))                                            return 'react-vendor'
          }
        },
      },
    },
  },
})
