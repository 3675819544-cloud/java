<script setup>
import { onMounted, ref } from 'vue'

import PixelButton from '@/components/PixelButton.vue'
import PixelCheckbox from '@/components/PixelCheckbox.vue'
import PixelField from '@/components/PixelField.vue'
import PixelInput from '@/components/PixelInput.vue'
import { PROVIDERS, SITE } from '@/constants/site'
import { useLoginForm } from '@/composables/useLoginForm'

const emit = defineEmits(['success'])

/**
 * 表单状态、校验、进度条、记住我全部由 composable 提供，
 * 组件只负责把状态接到模板上 + 处理焦点这类 DOM 细节。
 */
const {
  form,
  errors,
  submitting,
  percent,
  passwordType,
  toggleLabel,
  validateField,
  clearError,
  togglePassword,
  restoreRemembered,
  submit,
} = useLoginForm({
  onAuthenticated: (payload) => emit('success', payload),
})

/* 模板引用：校验失败 / 切换密码可见性后要把光标送回去 */
const accountRef = ref(null)
const passwordRef = ref(null)

/* 首次进入时回填「记住我」的账号 */
const restored = restoreRemembered()

onMounted(() => {
  if (restored) passwordRef.value?.focus()
})

function onSubmit() {
  const result = submit()
  if (result.ok) return

  if (result.focus === 'account') accountRef.value?.focus()
  else if (result.focus === 'password') passwordRef.value?.focus()
}

function onTogglePassword() {
  togglePassword()
  // 等 type 切换完成再聚焦，否则部分浏览器会丢失选区
  requestAnimationFrame(() => passwordRef.value?.focus())
}

function onQuickLogin(provider) {
  // TODO: 接入各平台的 OAuth 跳转
  console.info(`[BlockCraft] 触发第三方登录：${provider}`)
}
</script>

<template>
  <form class="login-form" novalidate @submit.prevent="onSubmit">
    <!-- 账号 -->
    <PixelField
      field-id="account"
      label="账号（邮箱 / 用户名）"
      :error="errors.account"
    >
      <PixelInput
        ref="accountRef"
        field-id="account"
        v-model="form.account"
        placeholder="Steve"
        autocomplete="username"
        :invalid="Boolean(errors.account)"
        @blur="validateField('account')"
        @input="clearError('account')"
      />
    </PixelField>

    <!-- 密码 -->
    <PixelField field-id="password" label="密码" :error="errors.password">
      <PixelInput
        ref="passwordRef"
        field-id="password"
        v-model="form.password"
        :type="passwordType"
        placeholder="••••••••"
        autocomplete="current-password"
        :invalid="Boolean(errors.password)"
        toggleable
        :toggle-label="toggleLabel"
        @blur="validateField('password')"
        @input="clearError('password')"
        @toggle="onTogglePassword"
      />
    </PixelField>

    <!-- 记住我 + 忘记密码 -->
    <div class="options">
      <PixelCheckbox
        field-id="remember"
        v-model="form.remember"
        :label="SITE.rememberLabel"
      />

      <a class="link" href="#">{{ SITE.forgotPassword }}</a>
    </div>

    <!-- 主按钮（含像素进度条加载态） -->
    <PixelButton
      variant="primary"
      type="submit"
      :loading="submitting"
      :percent="percent"
    >
      {{ SITE.submitLabel }}
    </PixelButton>

    <!-- 分隔线 -->
    <div class="divider">
      <span>{{ SITE.dividerText }}</span>
    </div>

    <!-- 第三方登录 -->
    <div class="quick">
      <PixelButton
        v-for="provider in PROVIDERS"
        :key="provider"
        @click="onQuickLogin(provider)"
      >
        {{ provider }}
      </PixelButton>
    </div>

    <!-- 注册引导 -->
    <p class="panel-foot">
      {{ SITE.footerTip }}<a class="link" href="#">{{ SITE.footerAction }}</a>
    </p>
  </form>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ---------------- 选项行 ---------------- */
.options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}

/* ---------------- 链接 ---------------- */
.link {
  font-size: 12px;
  color: var(--link);
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.6);
  border-bottom: 2px solid var(--link-underline);
}

.link:hover {
  color: var(--link-hover);
  border-bottom-color: var(--link-hover);
}

/* ---------------- 分隔线 ---------------- */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0 16px;
  font-size: 11px;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 3px;
  background: #a8a8a8;
  border-bottom: 2px solid #e0e0e0;
}

/* ---------------- 第三方登录 ---------------- */
.quick {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

/* ---------------- 注册引导 ---------------- */
.panel-foot {
  margin-top: 20px;
  font-size: 12px;
  text-align: center;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
}

@media (max-width: 640px) {
  .quick {
    grid-template-columns: 1fr;
  }
}
</style>
