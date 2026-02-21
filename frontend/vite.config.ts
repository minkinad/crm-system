// Vite configuration for React frontend bundle.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Base path is overridden in CI for GitHub Pages repo subpath.
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
});
