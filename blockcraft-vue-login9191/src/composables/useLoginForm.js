import { computed, reactive, ref } from 'vue'

import { authApi } from '@/api'
import { RESULT_CODE } from '@/constants/api'
import { SITE } from '@/constants/site'
import { useProgress } from '@/composables/useProgress'
import { saveSession } from '@/utils/auth'
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
 * 提交链路：前端校验 -> POST /api/auth/login -> 保存 token -> 播放进度条 -> 回调
 * 进度条是装饰性的（「加载世界中…」），所以让它和接口请求并行，
 * 谁慢等谁，接口报错时立刻中断动画并显示错误，不让用户白等 1.4 秒。
 *
 * @param {{ onAuthenticated?: (payload: { user: object }) => void }} options
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

  const { percent, start: startProgress, stop: stopProgress } = useProgress(SITE.loginDuration)

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
  /** 把服务端错误码翻译成「哪个输入框下面显示什么」 */
  function applyServerError(error) {
    switch (error?.code) {
      case RESULT_CODE.USER_NOT_FOUND:
        errors.account = error.message
        return 'account'
      case RESULT_CODE.USER_DISABLED:
        errors.account = error.message
        return 'account'
      case RESULT_CODE.PASSWORD_ERROR:
        errors.password = error.message
        return 'password'
      default:
        // 参数错误之类直接抛给顶部提示条
        return null
    }
  }

  /**
   * @returns {Promise<{ ok: false, focus?: string|null, error?: Error } | { ok: true, user: object }>}
   */
  async function submit() {
    if (submitting.value) return { ok: false, focus: null }

    const okAccount = validateField('account')
    const okPassword = validateField('password')

    if (!okAccount || !okPassword) {
      // 与原实现的聚焦顺序一致：账号没问题才去聚焦密码
      return { ok: false, focus: okAccount ? 'password' : 'account' }
    }

    submitting.value = true

    // 进度条与请求并行跑（谁慢等谁）
    const progress = new Promise((resolve) => startProgress(resolve))

    try {
      const data = await authApi.login({
        username: form.account.trim(),
        password: form.password,
      })

      await progress

      persistRemembered()
      saveSession({ token: data.token, user: data.user })

      submitting.value = false
      onAuthenticated?.(data)
      return { ok: true, user: data.user }
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
