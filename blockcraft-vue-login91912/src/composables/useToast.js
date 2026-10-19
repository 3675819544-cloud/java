import { reactive } from 'vue'

/**
 * 全局像素提示条状态
 *
 * 登录成功 / 注册成功 / 校验失败等提示统一从这里触发，
 * 由 App.vue 里的 <PixelToast> 订阅展示，避免每个表单各自管一套 toast。
 * 模块级单例：整个应用共享同一份状态。
 */

const state = reactive({
  visible: false,
  message: '',
})

let timer = null

/**
 * @returns {{ state: typeof state, show: (message: string, duration?: number) => void }}
 */
export function useToast() {
  function show(message, duration = 2800) {
    state.message = message
    state.visible = true

    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      state.visible = false
    }, duration)
  }

  return { state, show }
}
