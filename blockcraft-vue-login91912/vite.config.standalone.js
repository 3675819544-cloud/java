import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

/**
 * 「单文件」构建配置（可选）
 *
 * 用途：把 CSS / JS 全部内联进一个 index.html，
 * 产物可以直接双击打开（file://），不需要任何服务器 ——
 * 也就是把原版静态页「双击就能看」的体验补回来。
 *
 *   npm run build:standalone   →  产出 standalone/index.html
 *
 * 注意：file:// 下浏览器会拦截 <script type="module">（CORS），
 * 所以这里把产物打成 iife 经典脚本，确保双击可运行。
 */
export default defineConfig({
  plugins: [vue(), viteSingleFile()],

  // 相对路径，file:// 下才能找到资源
  base: './',

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    outDir: 'standalone',
    // 单文件产物不需要单独的资源目录
    assetsDir: 'assets',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    // 关闭 modulepreload 的 polyfill 注入，保持产物干净
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        format: 'iife',
      },
    },
  },
})
