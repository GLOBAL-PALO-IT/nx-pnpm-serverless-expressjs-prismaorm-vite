/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import path from 'path';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/frontend',
  server: {
    port: 4200,
    host: 'localhost',
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: {
    port: 4200,
    host: 'localhost',
  },
  resolve: {
    alias: {
      '@nx-serverless/ui/styles': path.resolve(
        __dirname,
        '../../packages/ui/src/styles/globals.css'
      ),
      '@': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      routeFileIgnorePattern: '.spec.',
    }),
    react(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../../dist/apps/frontend',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    watch: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '../../coverage/apps/frontend',
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: [
        'node_modules/',
        'src/**/*.spec.{ts,tsx,js,jsx}',
        'src/**/*.test.{ts,tsx,js,jsx}',
        'src/main.tsx',
        'src/routeTree.gen.ts',
        'src/router.d.ts',
        '**/*.config.{ts,js}',
        '**/jest.setup.ts',
      ],
    },
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
}));
