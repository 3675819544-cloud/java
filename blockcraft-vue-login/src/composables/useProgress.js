import { onBeforeUnmount, ref } from 'vue'

/**
 * 像素进度条动画
 *
 * 原实现用 requestAnimationFrame 手写，并把宽度直接写进 DOM。
 * 这里改为**驱动一个 ref**，由 Vue 响应式渲染到 style 上，
 * 并在组件卸载时自动取消动画，避免内存泄漏。
 *
 * @param {number} duration 动画总时长（毫秒）
 */
export function useProgress(duration = 1400) {
  const percent = ref(0)
  const active = ref(false)

  let frameId = null
  let startTime = 0

  function stop() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId)
      frameId = null
    }
    active.value = false
  }

  /**
   * 播放一次进度：0% → 100%，结束后回调
   * @param {() => void} [onDone]
   */
  function start(onDone) {
    stop()

    active.value = true
    percent.value = 0
    startTime = performance.now()

    const frame = (now) => {
      const ratio = Math.min((now - startTime) / duration, 1)
      percent.value = Math.floor(ratio * 100)

      if (ratio < 1) {
        frameId = requestAnimationFrame(frame)
      } else {
        frameId = null
        percent.value = 100
        active.value = false
        onDone?.()
      }
    }

    frameId = requestAnimationFrame(frame)
  }

  function reset() {
    stop()
    percent.value = 0
  }

  onBeforeUnmount(stop)

  return { percent, active, start, stop, reset }
}
