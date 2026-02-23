import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'web',
  base: '/wavegen-remotion/',
  plugins: [react()],
  publicDir: '../public',
  build: {
    outDir: '../dist-web',
    emptyOutDir: true,
  },
});
