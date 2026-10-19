<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import CaptchaImage from '@/components/CaptchaImage.vue'
import PixelButton from '@/components/PixelButton.vue'
import PixelCheckbox from '@/components/PixelCheckbox.vue'
import PixelField from '@/components/PixelField.vue'
import PixelInput from '@/components/PixelInput.vue'
import { SITE } from '@/constants/site'
import { useRegisterForm } from '@/composables/useRegisterForm'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { show } = useToast()

/* 图片验证码凭证，由 CaptchaImage 的 change 事件回写（明文答案在后端，前端拿不到） */
const captchaId = ref('')
const captchaRef = ref(null)

function onCaptchaChange(id) {
  captchaId.value = id
}

function refreshCaptcha() {
  captchaRef.value?.refresh()
}

const {
  form,
  errors,
  submitting,
  percent,
  passwordType,
  toggleLabel,
  validateField,
  clearError,
  validateCaptcha,
  togglePassword,
  submit,
} = useRegisterForm({
  getCaptchaId: () => captchaId.value,
  refreshCaptcha,
  onRegistered: () => {
    // 注册成功后跳回登录页，让用户输入新账号登录
    router.replace('/login')
  },
})

/* 模板引用：校验失败时把光标送回对应输入框 */
const usernameRef = ref(null)
const passwordRef = ref(null)
const confirmRef = ref(null)
const captchaRefInput = ref(null)

onMounted(() => usernameRef.value?.focus())

async function onSubmit() {
  // submit() 会真实请求 POST /api/auth/register
  const result = await submit()
  if (result.ok) return

  // 没有落到具体输入框的错误（比如后端没启动）用顶部提示条告知
  if (!result.focus) {
    if (result.error) show(result.error.message)
    return
  }

  switch (result.focus) {
    case 'username':
      usernameRef.value?.focus()
      break
    case 'password':
      passwordRef.value?.focus()
      break
    case 'confirm':
      confirmRef.value?.focus()
      break
    case 'captcha':
      captchaRefInput.value?.focus()
      break
  }
}

function onTogglePassword() {
  togglePassword()
  requestAnimationFrame(() => passwordRef.value?.focus())
}
</script>

<template>
  <form class="register-form" novalidate @submit.prevent="onSubmit">
    <!-- 用户名（无邮箱） -->
    <PixelField
      field-id="reg-username"
      label="用户名"
      :error="errors.username"
    >
      <PixelInput
        ref="usernameRef"
        field-id="reg-username"
        v-model="form.username"
        placeholder="Steve"
        autocomplete="username"
        :invalid="Boolean(errors.username)"
        @blur="validateField('username')"
        @input="clearError('username')"
      />
    </PixelField>

    <!-- 密码 -->
    <PixelField field-id="reg-password" label="密码" :error="errors.password">
      <PixelInput
        ref="passwordRef"
        field-id="reg-password"
        v-model="form.password"
        :type="passwordType"
        placeholder="••••••••"
        autocomplete="new-password"
        :invalid="Boolean(errors.password)"
        toggleable
        :toggle-label="toggleLabel"
        @blur="validateField('password')"
        @input="clearError('password')"
        @toggle="onTogglePassword"
      />
    </PixelField>

    <!-- 确认密码 -->
    <PixelField field-id="reg-confirm" label="确认密码" :error="errors.confirm">
      <PixelInput
        ref="confirmRef"
        field-id="reg-confirm"
        v-model="form.confirm"
        :type="passwordType"
        placeholder="••••••••"
        autocomplete="new-password"
        :invalid="Boolean(errors.confirm)"
        @blur="validateField('confirm')"
        @input="clearError('confirm')"
      />
    </PixelField>

    <!-- 图片验证码 -->
    <PixelField field-id="reg-captcha" label="图片验证码" :error="errors.captcha">
      <div class="captcha-row">
        <PixelInput
          ref="captchaRefInput"
          field-id="reg-captcha"
          v-model="form.captcha"
          placeholder="输入右侧字符"
          autocomplete="off"
          :invalid="Boolean(errors.captcha)"
          @blur="validateCaptcha"
          @input="clearError('captcha')"
        />

        <CaptchaImage
          ref="captchaRef"
          @change="onCaptchaChange"
        />
      </div>
    </PixelField>

    <!-- 同意协议 -->
    <div class="agree">
      <PixelCheckbox
        field-id="reg-agree"
        v-model="form.agree"
        :label="SITE.agreeLabel"
      />
      <p v-if="errors.agree" class="agree-error" role="alert">
        {{ errors.agree }}
      </p>
    </div>

    <!-- 主按钮（含像素进度条加载态） -->
    <PixelButton
      variant="primary"
      type="submit"
      :loading="submitting"
      :percent="percent"
    >
      {{ SITE.registerSubmitLabel }}
    </PixelButton>

    <!-- 返回登录 -->
    <p class="panel-foot">
      {{ SITE.registerFooterTip
      }}<router-link class="link" to="/login">{{
        SITE.registerFooterAction
      }}</router-link>
    </p>
  </form>
</template>

<style scoped>
.register-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ---------------- 验证码行 ---------------- */
.captcha-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ---------------- 同意协议 ---------------- */
.agree {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 2px;
}

.agree-error {
  min-height: 14px;
  font-size: 11px;
  color: var(--danger);
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.7);
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

/* ---------------- 返回登录 ---------------- */
.panel-foot {
  margin-top: 20px;
  font-size: 12px;
  text-align: center;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
}

@media (max-width: 640px) {
  .captcha-row {
    gap: 8px;
  }
}
</style>
