import { reactive, ref } from 'vue'

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
 * @param {{
 *   onRegistered?: (payload: { username: string }) => void,
 *   getCaptcha: () => string,
 *   refreshCaptcha: () => void,
 * }} options
 */
export function useRegisterForm({ onRegistered, getCaptcha, refreshCaptcha } = {}) {
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

  const { percent, start: startProgress } = useProgress(SITE.registerDuration)
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

  /** 校验图片验证码：必填 + 与当前码一致（不区分大小写） */
  function validateCaptcha() {
    const ok = validateField('captcha')
    if (!ok) return false

    const expected = (getCaptcha() ?? '').trim().toLowerCase()
    const input = form.captcha.trim().toLowerCase()
    if (input !== expected) {
      errors.captcha = '验证码不正确'
      refreshCaptcha?.() // 答错自动换一张
      return false
    }
    return true
  }

  /* ---------------- 密码可见性 ---------------- */
  function togglePassword() {
    const showPwd = passwordType.value === 'password'
    passwordType.value = showPwd ? 'text' : 'password'
    toggleLabel.value = showPwd ? '隐藏' : '显示'
    return true
  }

  /* ---------------- 提交 ---------------- */
  /**
   * @returns {{ ok: boolean, focus?: 'username' | 'password' | 'confirm' | 'captcha' }}
   */
  function submit() {
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

    // TODO: 此处替换为真实注册请求
    // const res = await fetch('/api/register', { method: 'POST', body: ... })
    startProgress(() => {
      submitting.value = false
      show(SITE.registerSuccessMessage)
      onRegistered?.({ username: form.username.trim() })
    })

    return { ok: true }
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
