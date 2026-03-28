import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Ready Meen',
        short_name: 'Ready Meen',
        description: 'Order fresh fish from local vendors',
        theme_color: '#0284c7',
        background_color: '#f0f9ff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'My Orders', short_name: 'Orders', url: '/orders', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'My Cart', short_name: 'Cart', url: '/cart', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
        ],
        categories: ['shopping', 'food'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallbackDenylist: [/^\/firebase-messaging-sw\.js$/],
        globIgnores: ['**/firebase-messaging-sw.js'],
        runtimeCaching: [
          {
            // Product images — cache for 24 hours
            urlPattern: /\.(?:png|jpg|jpeg|webp|gif|svg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            // Supabase storage images (product photos)
            urlPattern: /supabase.*storage/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'product-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            // Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            // Google Fonts files
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // API calls — never cache (user-specific data, real-time stock/orders)
            urlPattern: /\/api\//,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
