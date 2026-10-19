<script setup>
import { onMounted, ref } from 'vue'

import { authApi } from '@/api'

/**
 * 图片验证码（服务端生成）
 *
 * 相比原来「Canvas 本地画码」的做法，改成了向后端领取：
 *   GET /api/auth/captcha -> { captchaId, image, expireSeconds }
 *
 *  - `image` 是 data:image/png;base64 的 data URL，直接塞给 <img :src>
 *  - `captchaId` 是这张码的凭证，通过 change 事件抛给父组件，
 *    注册时一起提交，由后端比对——前端拿不到明文答案
 *  - 点击图片 / 「换一张」都会重新领取，旧凭证在后端随即失效
 *
 * 保留原版的像素风：2 倍图 + image-rendering: pixelated + 凹槽边框。
 */

const emit = defineEmits(['change'])

const loading = ref(false)
const src = ref('')
const failed = ref(false)

/** 当前验证码凭证 */
let captchaId = ''

async function refresh() {
  if (loading.value) return

  loading.value = true
  try {
    const data = await authApi.captcha()
    src.value = data.image
    captchaId = data.captchaId
    failed.value = false
    emit('change', captchaId)
  } catch {
    src.value = ''
    captchaId = ''
    failed.value = true
    emit('change', '')
  } finally {
    loading.value = false
  }
}

function onClick() {
  // 失败状态下点击也重试
  refresh()
}

defineExpose({ refresh, getCaptchaId: () => captchaId })

onMounted(refresh)
</script>

<template>
  <button
    type="button"
    class="captcha"
    :class="{ 'is-loading': loading }"
    :aria-label="failed ? '验证码加载失败，点击重试' : '点击刷新验证码'"
    @click="onClick"
  >
    <span class="captcha-box">
      <img v-if="src" class="captcha-img" :src="src" alt="验证码" />

      <span v-else class="captcha-placeholder">
        {{ failed ? '加载失败，点击重试' : '加载中…' }}
      </span>
    </span>

    <span class="captcha-refresh">换一张</span>
  </button>
</template>

<style scoped>
.captcha {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
}

/* 验证码画布容器：复用 MC 文本凹槽质感 */
.captcha-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 46px;
  overflow: hidden;
  background: #000;
  border: 2px solid;
  border-color: var(--slot-lo) var(--slot-hi) var(--slot-hi) var(--slot-lo);
}

.captcha-img {
  display: block;
  width: 120px;
  height: 46px;
  /* 关掉浏览器平滑，保持像素硬边 */
  image-rendering: pixelated;
}

.captcha-placeholder {
  padding: 0 4px;
  font-size: 10px;
  line-height: 1.4;
  text-align: center;
  color: #9a9a9a;
}

.captcha.is-loading {
  cursor: progress;
}

.captcha-refresh {
  font-size: 11px;
  color: var(--link);
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.6);
  border-bottom: 2px solid var(--link-underline);
  white-space: nowrap;
}

.captcha-refresh:hover {
  color: var(--link-hover);
  border-bottom-color: var(--link-hover);
}
</style>
