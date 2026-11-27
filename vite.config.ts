import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            // Cache stable SDK/framework code separately from application pages.
            includeDependenciesRecursively: true,
            groups: [
              // Shared SDK initialization must not depend on the application entry.
              {
                name: 'firebase-core',
                test: /[\\/]node_modules[\\/]@firebase[\\/](?!auth[\\/]|firestore[\\/])/,
                priority: 10,
              },
              { name: 'firebase-firestore', test: /[\\/]node_modules[\\/]@firebase[\\/]firestore[\\/]/ },
              { name: 'firebase-auth', test: /[\\/]node_modules[\\/]@firebase[\\/]auth[\\/]/ },
              { name: 'react-vendor', test: /[\\/]node_modules[\\/](?:react|react-dom|scheduler)[\\/]/ },
              { name: 'motion-vendor', test: /[\\/]node_modules[\\/](?:motion|motion-dom|motion-utils|framer-motion)[\\/]/ },
            ],
          },
        },
      },
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(env.GOOGLE_MAPS_PLATFORM_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
