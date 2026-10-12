import { createRouter, createWebHashHistory } from 'vue-router'

import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import HomeView from '@/views/HomeView.vue'
import { isLoggedIn } from '@/utils/auth'

/**
 * 路由表：登录 / 注册 / 主页
 * 用 hash 模式，免服务器配置，dist / standalone 直接双击也能跑。
 *
 * 登录态由前端本地 token 判断（isLoggedIn）；真正的有效性仍由后端
 * 在 /api/user/** 上用 JWT 校验。访问 /home 必须已登录，否则踢回登录页。
 */
const routes = [
  // 根路径交给全局守卫动态决定去 /home 还是 /login
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/home', name: 'home', component: HomeView, meta: { requiresAuth: true } },
  // 兜底：未知路径统一回登录
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  // 切换页面时回到顶部，避免残留滚动位置
  scrollBehavior() {
    return { top: 0 }
  },
})

// 登录态守卫：未登录访问受保护页 -> 登录页；根路径按登录态分流
router.beforeEach((to) => {
  const loggedIn = isLoggedIn()
  if (to.path === '/') {
    return loggedIn ? '/home' : '/login'
  }
  if (to.meta?.requiresAuth && !loggedIn) {
    return '/login'
  }
  return true
})

export default router
