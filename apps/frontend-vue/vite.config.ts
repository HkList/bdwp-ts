import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    // vueJsx(),
    vueDevTools(),
    visualizer({
      open: false, // 打包展示完成后自动打开浏览器报告
      filename: 'stats.html', // 生成的分析文件名
      gzipSize: true, // 显示 gzip 后的体积
      brotliSize: true, // 显示 brotli 后的体积
    }),
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
})
