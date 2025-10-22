import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Ensure base is set to '/' for Azure deployment
  build: {
    outDir: 'dist' // Explicitly define output directory
  },
  server: {
    proxy: {
      '/api/v1': {
        target: 'https://api.ladanv.id.vn',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // If the backend issues a redirect (302 Location) back to the api host,
            // rewrite it to point at the local dev server so the browser follows
            // the proxied redirect instead of trying to contact the API host directly.
            try {
              const loc = proxyRes.headers && (proxyRes.headers as Record<string, unknown>)['location'];
              if (typeof loc === 'string' && loc.startsWith('https://api.ladanv.id.vn')) {
                const host = req.headers.host || 'localhost:5174';
                const newLoc = `http://${host}${loc.replace('https://api.ladanv.id.vn', '')}`;
                (proxyRes.headers as Record<string, string>)['location'] = newLoc;
                console.log('Rewrote Location header for redirect to', newLoc);
              }
            } catch (e) {
              // ignore
            }
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      },
      '/oauth2': {
        target: 'https://api.ladanv.id.vn',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending OAuth Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            try {
              const loc = proxyRes.headers && (proxyRes.headers as Record<string, unknown>)['location'];
              if (typeof loc === 'string' && loc.startsWith('https://api.ladanv.id.vn')) {
                const host = req.headers.host || 'localhost:5174';
                const newLoc = `http://${host}${loc.replace('https://api.ladanv.id.vn', '')}`;
                (proxyRes.headers as Record<string, string>)['location'] = newLoc;
                console.log('Rewrote OAuth Location header for redirect to', newLoc);
              }
            } catch (e) {
              // ignore
            }
            console.log('Received OAuth Response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
})
