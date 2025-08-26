import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'copy-icons',
      writeBundle() {
        // Ensure icons directory exists
        const iconsDir = resolve(__dirname, 'dist/icons');
        if (!existsSync(iconsDir)) {
          mkdirSync(iconsDir, { recursive: true });
        }

        // Copy icon files
        const iconFiles = [
          'icon-192x192.png',
          'icon-512x512.png',
          'icon-48x48.png',
          'icon-72x72.png',
          'icon-96x96.png',
          'icon-128x128.png',
          'icon-144x144.png',
          'icon-152x152.png',
          'icon-256x256.png',
          'icon-384x384.png',
        ];

        iconFiles.forEach(icon => {
          const src = resolve(__dirname, '..', 'icons', icon);
          const dest = resolve(iconsDir, icon);
          if (existsSync(src)) {
            copyFileSync(src, dest);
            console.log(`✅ Copied icon: ${icon}`);
          } else {
            console.warn(`⚠️  Icon not found: ${icon}`);
          }
        });
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'masked-icon.svg',
        'icons/icon-192x192.png',
        'icons/icon-512x512.png',
      ],
      manifest: {
        name: 'ScholarTrack',
        short_name: 'ScholarTrack',
        description: 'Local-first student tracking and classroom management system',
        theme_color: '#1976D2',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['education', 'productivity'],
        lang: 'en',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined,
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  optimizeDeps: {
    include: ['vue', 'vuetify', 'pinia', 'axios', 'idb'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
