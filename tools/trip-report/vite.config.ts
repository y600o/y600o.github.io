import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  base: "/tools/trip-report/",
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
    manifest: {
      name: '出差报表', short_name: '出差报表', description: '将钱迹报销账单整理为出差 Excel 报表',
      lang: 'zh-CN', id: '/tools/trip-report/', start_url: '/tools/trip-report/', scope: '/tools/trip-report/', display: 'standalone',
      background_color: '#f7f8fa', theme_color: '#2c8757',
      icons: [{src:'/tools/trip-report/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'}, {src:'/tools/trip-report/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'}, {src:'/tools/trip-report/icon-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}],
    },
    workbox: { maximumFileSizeToCacheInBytes: 4000000, globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'], navigateFallback: 'index.html' },
  })],
});
