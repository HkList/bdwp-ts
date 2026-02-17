import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
// import vueJsx from '@vitejs/plugin-vue-jsx'
// import vueDevTools from 'vite-plugin-vue-devtools'
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
          'lodash-es': ['lodash-es'],
          'naive-ui': ['naive-ui'],
          pinia: ['pinia'],
          'pro-naive-ui': ['pro-naive-ui'],
          vue: ['vue'],
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
    // vueJsx(),
    // vueDevTools(),
    visualizer({
      brotliSize: true, // 显示 brotli 后的体积
      filename: 'stats.html', // 生成的分析文件名
      gzipSize: true, // 显示 gzip 后的体积
      open: false, // 打包展示完成后自动打开浏览器报告
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
