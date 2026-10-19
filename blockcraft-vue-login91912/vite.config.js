import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * 后端地址：开发时前端跑 5173，后端 Spring Boot 跑 8081
 * 通过下面的 proxy 把 /api 开头的请求转发过去，浏览器视角下就没有跨域问题。
 */
const BACKEND_ORIGIN = process.env.VITE_BACKEND_ORIGIN || 'http://localhost:8081'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      // 用 @ 指向 src，避免出现 ../../../ 这种相对路径
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,
    open: true,
    proxy: {
      // 前端请求 /api/auth/login  ->  后端 http://localhost:8081/api/auth/login
      '/api': {
        target: BACKEND_ORIGIN,
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    // 像素风资源体积很小，产物直接输出到根目录便于部署
    assetsDir: 'assets',
  },
})
