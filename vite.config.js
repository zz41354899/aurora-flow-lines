import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 將 p5 單獨打包
          if (id.includes('node_modules/p5')) {
            return 'p5'
          }
          // 將 Vue 相關庫單獨打包
          if (id.includes('node_modules/vue')) {
            return 'vue-vendor'
          }
          // 將其他 node_modules 打包到 vendor
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    },
    // 提高 chunk 大小警告閾值到 1000 kB
    chunkSizeWarningLimit: 1000,
    // 使用 esbuild 壓縮（更快）
    minify: 'esbuild',
    // 啟用 CSS 代碼分割
    cssCodeSplit: true,
    // 優化依賴預構建
    target: 'esnext',
    // 啟用 source map（可選，生產環境可關閉）
    sourcemap: false
  }
})
