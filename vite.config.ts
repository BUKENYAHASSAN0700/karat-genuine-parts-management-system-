import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

const karatLogoPath = path.resolve(__dirname, 'karat.svg');

const karatLogoPlugin = () => ({
  name: 'karat-logo-asset',
  configureServer(server: { middlewares: { use: (handler: (req: any, res: any, next: () => void) => void) => void } }) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/karat.svg') {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.end(fs.readFileSync(karatLogoPath));
        return;
      }
      next();
    });
  },
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'karat.svg',
      source: fs.readFileSync(karatLogoPath),
    });
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), karatLogoPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      allowedHosts : ['hailee-unconspiring-ethyl.ngrok-free.dev']
    },
  };
});
