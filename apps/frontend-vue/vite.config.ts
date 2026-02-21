import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        chunkFileNames: 'assets/js/chunk/[name]-[hash].js',
        entryFileNames: 'assets/js/entry/[name]-[hash].js',
        manualChunks: {
          '@elysiajs/eden': ['@elysiajs/eden'],
          '@vueuse/core': ['@vueuse/core'],
          'naive-ui': ['naive-ui'],
          'pinia': ['pinia'],
          'pro-naive-ui': ['pro-naive-ui'],
          'vue': ['vue'],
          'vue-router': ['vue-router'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'vue',
      'pinia',
      'naive-ui',
      'vue-router',
      'pro-naive-ui',
      '@vueuse/core',
      '@elysiajs/eden',
    ],
  },
  plugins: [
    vue(),
    visualizer({
      brotliSize: true,
      filename: 'stats.html',
      gzipSize: true,
      open: false,
    }),
    compression(),
  ],
  resolve: {
    alias: {
      '@frontend': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        changeOrigin: true,
        target: 'http://localhost:3000',
      },
    },
  },
})
