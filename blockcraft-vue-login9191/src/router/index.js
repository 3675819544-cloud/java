import { createRouter, createWebHashHistory } from 'vue-router'

import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'

/**
 * 路由表：登录 / 注册互跳
 * 用 hash 模式，免服务器配置，dist / standalone 直接双击也能跑。
 */
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  // 兜底：未知路径统一回登录
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  // 切换页面时回到顶部，避免残留滚动位置
  scrollBehavior() {
    return { top: 0 }
  },
})
