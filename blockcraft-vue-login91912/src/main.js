import { createApp } from 'vue'

import { setUnauthorizedHandler } from '@/api'
import App from '@/App.vue'
import router from '@/router'
import { useToast } from '@/composables/useToast'
import { clearSession } from '@/utils/auth'

// 全局样式：令牌必须排在基础样式之前，base.css 里会引用这些变量
import '@/styles/tokens.css'
import '@/styles/base.css'

// 后端返回 401（token 过期 / 被篡改）时统一清登录态并回登录页
setUnauthorizedHandler(() => {
  clearSession()
  useToast().show('登录状态已失效，请重新登录')
  router.replace('/login')
})

createApp(App).use(router).mount('#app')
