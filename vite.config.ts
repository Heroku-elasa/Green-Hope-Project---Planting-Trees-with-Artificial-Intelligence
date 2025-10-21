import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  // Vite automatically exposes environment variables prefixed with VITE_
  // in `import.meta.env`. The previous `define` block for `process.env`
  // has been removed in favor of using the standard `import.meta.env` object
  // directly in the application code for a more robust setup.
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
});