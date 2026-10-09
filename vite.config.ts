import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const isBase44Preview = process.env.BASE44_PREVIEW_MODE === '1';
  return {
    plugins: [react(), tailwindcss()],
    // Base44 sandbox preview exposes the platform flag to client code so
    // src/lib/firebase.ts can fall back to the built-in localStorage store.
    // Unset/other values keep Vite's default `VITE_` prefix.
    envPrefix: isBase44Preview ? ['VITE_', 'BASE44_'] : 'VITE_',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
