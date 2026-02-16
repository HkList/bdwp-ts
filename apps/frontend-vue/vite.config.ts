import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueJsx from '@vitejs/plugin-vue-jsx'
// import vueDevTools from 'vite-plugin-vue-devtools'
import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    vue(),
    // vueJsx(),
    // vueDevTools(),
    visualizer({
      open: false, // 打包展示完成后自动打开浏览器报告
      filename: 'stats.html', // 生成的分析文件名
      gzipSize: true, // 显示 gzip 后的体积
      brotliSize: true, // 显示 brotli 后的体积
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
        target: 'http://localhost:3000',
        changeOrigin: true,
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'naive-ui': ['naive-ui'],
          'lodash-es': ['lodash-es'],
          'vue-router': ['vue-router'],
          '@vueuse/core': ['@vueuse/core'],
          'pro-naive-ui': ['pro-naive-ui'],
          vue: ['vue'],
          pinia: ['pinia'],
          '@elysiajs/eden': ['@elysiajs/eden'],
        },
        chunkFileNames: 'assets/js/chunk/[name]-[hash].js',
        entryFileNames: 'assets/js/entry/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
})
