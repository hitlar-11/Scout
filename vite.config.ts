import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // middleware plugin to catch malformed request URLs early and log them
    {
      name: 'catch-malformed-urls',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || ''
          try {
            // attempt to decode; if it throws, log and respond with 400
            decodeURI(url)
          } catch (err) {
            // log so we can see the offending URL in terminal
            // eslint-disable-next-line no-console
            console.error('[vite] Malformed request URL detected:', url)
            res.statusCode = 400
            res.end('Malformed request URL')
            return
          }
          next()
        })
      },
    },
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  // Exclude server-side files from browser bundle
  optimizeDeps: {
    exclude: ['postgres', 'drizzle-orm'],
  },
  ssr: {
    noExternal: ['postgres', 'drizzle-orm'],
  },
  // Fix for URI malformed errors
  server: {
    fs: {
      strict: false,
    },
  },
})

