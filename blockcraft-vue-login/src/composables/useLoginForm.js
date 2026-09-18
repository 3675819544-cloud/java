import { computed, reactive, ref } from 'vue'

import { SITE } from '@/constants/site'
import { useProgress } from '@/composables/useProgress'
import {
  readStored,
  removeStored,
  writeStored,
} from '@/utils/storage'
import {
  account as accountRule,
  minLength,
  required,
  runRules,
} from '@/utils/validators'

/**
 * 字段校验规则表
 * 新增字段只要在这里加一行即可，submit / blur 逻辑无需改动。
 */
const RULES = {
  account: [accountRule('请输入账号')],
  password: [required('请输入密码'), minLength(6, '密码至少 6 位')],
}

/**
 * 登录表单状态机
 *
 * 把原来 script.js 里的「查 DOM → 加 class → 写 textContent」
 * 全部改写成「改状态 → 视图自动更新」。
 *
 * @param {{ onAuthenticated?: (payload: { account: string }) => void }} options
 */
export function useLoginForm({ onAuthenticated } = {}) {
  /* ---------------- 状态 ---------------- */
  const form = reactive({
    account: '',
    password: '',
    remember: false,
  })

  const errors = reactive({
    account: '',
    password: '',
  })

  const showPassword = ref(false)
  const submitting = ref(false)

  const { percent, start: startProgress } = useProgress(SITE.loginDuration)

  /* ---------------- 派生状态 ---------------- */
  const passwordType = computed(() => (showPassword.value ? 'text' : 'password'))
  const toggleLabel = computed(() => (showPassword.value ? '隐藏' : '显示'))
  const canSubmit = computed(() => !submitting.value)

  /* ---------------- 校验 ---------------- */
  function validateField(name) {
    errors[name] = runRules(form[name], RULES[name] ?? [])
    return !errors[name]
  }

  function clearError(name) {
    errors[name] = ''
  }

  /** 失焦时校验 */
  function handleBlur(name) {
    validateField(name)
  }

  /** 输入时清除该字段错误（与原实现一致） */
  function handleInput(name) {
    if (errors[name]) clearError(name)
  }

  /* ---------------- 密码可见性 ---------------- */
  function togglePassword() {
    showPassword.value = !showPassword.value
    // 光标回到输入框，避免焦点丢在按钮上（原实现同样如此）
    return true
  }

  /* ---------------- 记住我 ---------------- */
  /** 读取上次记住的账号；返回是否需要把焦点放到密码框 */
  function restoreRemembered() {
    const saved = readStored(SITE.rememberKey)
    if (!saved) return false

    form.account = saved
    form.remember = true
    return true
  }

  function persistRemembered() {
    if (form.remember) {
      writeStored(SITE.rememberKey, form.account.trim())
    } else {
      removeStored(SITE.rememberKey)
    }
  }

  /* ---------------- 提交 ---------------- */
  /**
   * @returns {{ ok: false, focus: 'account' | 'password' } | { ok: true }}
   */
  function submit() {
    if (submitting.value) return { ok: false, focus: null }

    const okAccount = validateField('account')
    const okPassword = validateField('password')

    if (!okAccount || !okPassword) {
      // 与原实现的聚焦顺序一致：账号没问题才去聚焦密码
      return { ok: false, focus: okAccount ? 'password' : 'account' }
    }

    submitting.value = true

    // TODO: 此处替换为真实登录请求
    // const res = await fetch('/api/login', { method: 'POST', body: ... })
    startProgress(() => {
      persistRemembered()
      submitting.value = false
      onAuthenticated?.({ account: form.account.trim() })
    })

    return { ok: true }
  }

  return {
    // 状态
    form,
    errors,
    showPassword,
    submitting,
    percent,
    // 派生
    passwordType,
    toggleLabel,
    canSubmit,
    // 方法
    validateField,
    clearError,
    handleBlur,
    handleInput,
    togglePassword,
    restoreRemembered,
    submit,
  }
}
