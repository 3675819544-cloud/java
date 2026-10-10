import { createApp } from 'vue'

import App from '@/App.vue'
import router from '@/router'

// 全局样式：令牌必须排在基础样式之前，base.css 里会引用这些变量
import '@/styles/tokens.css'
import '@/styles/base.css'

createApp(App).use(router).mount('#app')
