import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

function saveMapPlugin() {
  return {
    name: 'save-map-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-map', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { filename, content } = JSON.parse(body);
            if (!filename || !content) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Filename and content required' }));
            }
            const mapsDir = fileURLToPath(new URL('./src/maps', import.meta.url));
            if (!fs.existsSync(mapsDir)) {
              fs.mkdirSync(mapsDir, { recursive: true });
            }
            const safeName = filename.endsWith('.js') ? filename : `${filename}.js`;
            const filePath = path.join(mapsDir, safeName);
            fs.writeFileSync(filePath, content, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, path: filePath, filename: safeName }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [vue(), saveMapPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    open: false
  }
})
