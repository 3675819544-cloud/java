<script setup>
import PixelProgressBar from '@/components/PixelProgressBar.vue'

/**
 * 像素风按钮
 * - variant="primary"：主按钮，带内置进度条加载态
 * - variant="ghost"：第三方登录的次级按钮
 */
defineProps({
  variant: {
    type: String,
    default: 'ghost',
    validator: (v) => ['primary', 'ghost'].includes(v),
  },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  /** 加载态：隐藏文字，显示像素进度条 */
  loading: { type: Boolean, default: false },
  /** 加载态进度百分比 */
  percent: { type: Number, default: 0 },
})
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn-${variant}`, { 'is-loading': loading }]"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : null"
  >
    <span class="btn-label">
      <slot />
    </span>

    <span v-if="loading" class="btn-progress">
      <PixelProgressBar :percent="percent" />
    </span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-family: inherit;
  font-size: 12px;
  color: var(--btn-text);
  text-shadow: 2px 2px 0 var(--ink);
  background: var(--btn);
  border: 3px solid;
  /* 上/左亮、下/右暗 = 凸起 */
  border-color: var(--gui-hi) var(--btn-edge) var(--btn-edge) var(--gui-hi);
  cursor: pointer;
  transition: background 0.1s steps(2, end), color 0.1s steps(2, end);
}

/* hover：提亮 + 描边泛黄（MC 按钮高亮手感） */
.btn:hover:not(:disabled) {
  background: var(--btn-hover);
  border-color: var(--btn-highlight);
  color: var(--btn-highlight);
}

/* 按下：立体边反转 + 位移 2px */
.btn:active:not(:disabled) {
  border-color: var(--btn-edge) var(--gui-hi) var(--gui-hi) var(--btn-edge);
  transform: translate(2px, 2px);
  box-shadow: none;
}

.btn:focus-visible {
  outline: 2px solid var(--btn-highlight);
  outline-offset: 2px;
}

/* ---------------- 主按钮 ---------------- */
.btn-primary {
  width: 100%;
  height: 52px;
  margin-top: 6px;
  font-size: 13px;
  letter-spacing: 0.08em;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.25);
}

.btn-primary:disabled {
  cursor: wait;
  color: #d8d8d8;
}

/* ---------------- 次级按钮 ---------------- */
.btn-ghost {
  height: 40px;
  font-size: 11px;
  padding: 0 4px;
  white-space: nowrap;
}

/* ---------------- 加载态 ---------------- */
.btn-label {
  transition: opacity 0.08s steps(1, end);
}

.btn-progress {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.is-loading .btn-label {
  opacity: 0;
}

@media (max-width: 640px) {
  .btn-ghost {
    height: 38px;
  }
}
</style>
