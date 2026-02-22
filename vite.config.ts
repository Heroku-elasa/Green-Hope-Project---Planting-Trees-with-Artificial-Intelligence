import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5000,
        host: '0.0.0.0',
        allowedHosts: true,
        cors: true,
        proxy: {
          '/api': {
            target: 'http://0.0.0.0:5000',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '')
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.AI_INTEGRATIONS_GEMINI_API_KEY || env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.AI_INTEGRATIONS_GEMINI_API_KEY || env.GEMINI_API_KEY),
        'process.env.AI_INTEGRATIONS_GEMINI_API_KEY': JSON.stringify(env.AI_INTEGRATIONS_GEMINI_API_KEY),
        'process.env.AI_INTEGRATIONS_GEMINI_BASE_URL': JSON.stringify(env.AI_INTEGRATIONS_GEMINI_BASE_URL),
        'process.env.VITE_POYO_API_KEY': JSON.stringify(env.POYO_API_KEY),
        'process.env.VITE_OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY),
        'process.env.VITE_PORTKEY_API_KEY': JSON.stringify(env.PORTKEY_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      optimizeDeps: {
        exclude: ['html-docx-js']
      },
      build: {
        commonjsOptions: {
          transformMixedEsModules: true,
          ignoreTryCatch: 'remove'
        }
      }
    };
});
