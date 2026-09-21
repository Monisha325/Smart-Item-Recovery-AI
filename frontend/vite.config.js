import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          'vendor-query':   ['@tanstack/react-query'],
          'vendor-forms':   ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-ui':      ['react-hot-toast', 'zustand'],
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
          'vendor-charts':  ['recharts'],
        },
      },
    },
  },
});
