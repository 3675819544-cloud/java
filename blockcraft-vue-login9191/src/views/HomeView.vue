<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { userApi } from '@/api'
import { clearSession, isLoggedIn } from '@/utils/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { show } = useToast()

const loading = ref(true)
const error = ref('')
const user = ref(null)

async function loadProfile() {
  loading.value = true
  error.value = ''
  try {
    // 后端 UserProfileController#info 会从 token 解析当前用户，无需传参
    user.value = await userApi.info()
  } catch (e) {
    error.value = e?.message || '加载失败，请重试'
  } finally {
    loading.value = false
  }
}

function logout() {
  // JWT 无状态，退出只需清掉本地登录态即可
  clearSession()
  show('已退出登录')
  router.replace('/login')
}

onMounted(() => {
  // 没登录态直接踢回登录页（路由守卫也会拦，这里双保险）
  if (!isLoggedIn()) {
    router.replace('/login')
    return
  }
  loadProfile()
})
</script>

<template>
  <div class="home-wrap">
    <div class="home-card">
      <h1 class="home-title">BlockCraft</h1>
      <p class="home-sub">欢迎回来，冒险家！</p>

      <div v-if="loading" class="home-state">正在加载你的资料…</div>
      <div v-else-if="error" class="home-state error">{{ error }}</div>
      <dl v-else class="home-info">
        <div><dt>账号</dt><dd>{{ user.username }}</dd></div>
        <div><dt>昵称</dt><dd>{{ user.nickname || '—' }}</dd></div>
        <div><dt>邮箱</dt><dd>{{ user.email || '—' }}</dd></div>
        <div><dt>状态</dt><dd>{{ user.status === 1 ? '正常' : '已禁用' }}</dd></div>
      </dl>

      <button class="home-logout" type="button" @click="logout">退出登录</button>
    </div>
  </div>
</template>

<style scoped>
.home-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-card {
  width: 320px;
  padding: 28px;
  background: #fff;
  border: 4px solid #2b2b2b;
  box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.25);
}

.home-title {
  font-size: 28px;
  margin: 0 0 4px;
  letter-spacing: 2px;
}

.home-sub {
  margin: 0 0 18px;
  color: #555;
}

.home-state {
  padding: 12px 0;
  color: #666;
}

.home-state.error {
  color: #c0392b;
}

.home-info {
  display: grid;
  gap: 10px;
  margin: 0 0 20px;
}

.home-info div {
  display: flex;
  justify-content: space-between;
  border-bottom: 2px dashed #ddd;
  padding-bottom: 6px;
}

.home-info dt {
  color: #888;
}

.home-info dd {
  margin: 0;
  font-weight: 600;
}

.home-logout {
  width: 100%;
  padding: 10px;
  border: 3px solid #2b2b2b;
  background: #ffd166;
  cursor: pointer;
  font-weight: 700;
}

.home-logout:hover {
  background: #ffb703;
}
</style>
