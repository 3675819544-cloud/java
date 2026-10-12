import { reactive, ref } from 'vue'

import { authApi } from '@/api'
import { RESULT_CODE } from '@/constants/api'
import { SITE } from '@/constants/site'
import { useProgress } from '@/composables/useProgress'
import { useToast } from '@/composables/useToast'
import {
  minLength,
  required,
  runRules,
  username as usernameRule,
} from '@/utils/validators'

/**
 * 注册字段校验规则表
 * 与登录一致：新增字段只需在这里加一行 + 在 RULES 里登记。
 * 注意：注册**不使用邮箱**，账号即游戏用户名。
 */
const RULES = {
  username: [required('请输入用户名'), usernameRule()],
  password: [required('请输入密码'), minLength(6, '密码至少 6 位')],
  captcha: [required('请输入验证码')],
}

/**
 * 注册表单状态机（结构与 useLoginForm 对齐）
 *
 * 验证码改为**服务端校验**：前端只负责「非空」，
 * 真正的比对发生在后端（POST /api/auth/register 里带 captchaId + captchaCode），
 * 这样前端 JS 被改了也刷不出正确答案。
 *
 * @param {{
 *   onRegistered?: (payload: { username: string }) => void,
 *   getCaptchaId: () => string,
 *   refreshCaptcha: () => void,
 * }} options
 */
export function useRegisterForm({ onRegistered, getCaptchaId, refreshCaptcha } = {}) {
  /* ---------------- 状态 ---------------- */
  const form = reactive({
    username: '',
    password: '',
    confirm: '',
    captcha: '',
    agree: false,
  })

  const errors = reactive({
    username: '',
    password: '',
    confirm: '',
    captcha: '',
    agree: '',
  })

  const submitting = ref(false)
  const passwordType = ref('password')
  const toggleLabel = ref('显示')

  const { percent, start: startProgress, stop: stopProgress } = useProgress(SITE.registerDuration)
  const { show } = useToast()

  /* ---------------- 校验 ---------------- */
  function validateField(name) {
    if (name === 'confirm') {
      // 跨字段校验：两次密码必须一致
      if (!form.confirm) errors.confirm = '请再次输入密码'
      else if (form.confirm !== form.password)
        errors.confirm = '两次输入的密码不一致'
      else errors.confirm = ''
      return !errors.confirm
    }

    errors[name] = runRules(form[name], RULES[name] ?? [])
    return !errors[name]
  }

  function clearError(name) {
    errors[name] = ''
  }

  /** 图片验证码：前端只校验必填，正确性交给后端 */
  function validateCaptcha() {
    return validateField('captcha')
  }

  /* ---------------- 密码可见性 ---------------- */
  function togglePassword() {
    const showPwd = passwordType.value === 'password'
    passwordType.value = showPwd ? 'text' : 'password'
    toggleLabel.value = showPwd ? '隐藏' : '显示'
    return true
  }

  /* ---------------- 提交 ---------------- */
  /** 各错误码 -> 对应输入框 + 是否需要换一张验证码 */
  function applyServerError(error) {
    switch (error?.code) {
      case RESULT_CODE.USERNAME_EXISTS:
        errors.username = error.message
        return 'username'
      case RESULT_CODE.PASSWORD_NOT_MATCH:
        errors.confirm = error.message
        return 'confirm'
      case RESULT_CODE.CAPTCHA_ERROR:
      case RESULT_CODE.CAPTCHA_EXPIRED:
        errors.captcha = error.message
        refreshCaptcha?.() // 答错 / 过期自动换一张
        return 'captcha'
      case RESULT_CODE.PARAM_ERROR:
        // 后端 @Valid 拦下来的参数问题，尽量落到对应框
        errors.username = error.message
        return 'username'
      default:
        return null
    }
  }

  /**
   * @returns {Promise<{ ok: boolean, focus?: 'username'|'password'|'confirm'|'captcha', error?: Error }>}
   */
  async function submit() {
    if (submitting.value) return { ok: false }

    const okUser = validateField('username')
    const okPwd = validateField('password')
    const okConfirm = validateField('confirm')
    const okCaptcha = validateCaptcha()

    if (!form.agree) errors.agree = '请先阅读并同意用户协议'

    if (!okUser || !okPwd || !okConfirm || !okCaptcha || !form.agree) {
      // 聚焦顺序：从上到下第一个有错的字段
      if (!okUser) return { ok: false, focus: 'username' }
      if (!okPwd) return { ok: false, focus: 'password' }
      if (!okConfirm) return { ok: false, focus: 'confirm' }
      if (!okCaptcha) return { ok: false, focus: 'captcha' }
      return { ok: false }
    }

    submitting.value = true

    const progress = new Promise((resolve) => startProgress(resolve))

    try {
      await authApi.register({
        username: form.username.trim(),
        password: form.password,
        confirmPassword: form.confirm,
        captchaId: getCaptchaId?.() ?? '',
        captchaCode: form.captcha.trim(),
      })

      await progress

      submitting.value = false
      show(SITE.registerSuccessMessage)
      onRegistered?.({ username: form.username.trim() })
      return { ok: true }
    } catch (error) {
      stopProgress()
      submitting.value = false
      return { ok: false, focus: applyServerError(error), error }
    }
  }

  return {
    // 状态
    form,
    errors,
    submitting,
    percent,
    // 派生
    passwordType,
    toggleLabel,
    // 方法
    validateField,
    clearError,
    validateCaptcha,
    togglePassword,
    submit,
  }
}
