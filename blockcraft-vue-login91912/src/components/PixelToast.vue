<script setup>
/**
 * 像素风提示条
 * 替代原生 alert()：同样传达「登录成功」，
 * 但不会阻塞线程，且外观与 GUI 面板统一。
 */
defineProps({
  message: { type: String, default: '' },
  visible: { type: Boolean, default: false },
})
</script>

<template>
  <Transition name="toast">
    <div v-if="visible" class="toast" role="status" aria-live="polite">
      <span class="toast-icon" aria-hidden="true">
        <svg viewBox="0 0 8 8" shape-rendering="crispEdges">
          <rect x="0" y="0" width="8" height="8" fill="#5aa64b" />
          <rect x="1" y="1" width="2" height="2" fill="#0e0e0e" />
          <rect x="5" y="1" width="2" height="2" fill="#0e0e0e" />
          <rect x="3" y="3" width="2" height="1" fill="#0e0e0e" />
          <rect x="2" y="4" width="4" height="2" fill="#0e0e0e" />
          <rect x="2" y="6" width="1" height="1" fill="#0e0e0e" />
          <rect x="5" y="6" width="1" height="1" fill="#0e0e0e" />
        </svg>
      </span>
      <p class="toast-text">{{ message }}</p>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 12px;
  /* 参考 Minecraft 成就弹窗：右上角滑入，避开居中的 Logo */
  max-width: min(88vw, 330px);
  padding: 13px 18px;
  background: var(--gui);
  border: 3px solid var(--gui-line);
  box-shadow: inset 3px 3px 0 var(--gui-hi), inset -3px -3px 0 var(--gui-lo),
    6px 6px 0 rgba(0, 0, 0, 0.35);
}

.toast-icon {
  flex: none;
  width: 26px;
  height: 26px;
  border: 2px solid var(--gui-line);
}

.toast-icon svg {
  width: 100%;
  height: 100%;
}

.toast-text {
  font-size: 11px;
  line-height: 1.6;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
}

/* 像素风进出场：不淡出，直接阶梯式位移动画 */
.toast-enter-active {
  animation: toastIn 0.28s steps(5, end) both;
}

.toast-leave-active {
  animation: toastIn 0.22s steps(5, end) reverse both;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(46px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    animation: none;
  }
}

/* ---------------- 窄屏：改为底部居中「提示条」 ----------------
   手机上右上角会压住居中的 Logo，改到底部居中，
   既避开品牌区，也更靠近刚点击的提交按钮。 */
@media (max-width: 640px) {
  .toast {
    top: auto;
    right: auto;
    bottom: 34px;
    left: 50%;
    max-width: calc(100vw - 32px);
    transform: translateX(-50%);
  }

  .toast-enter-active {
    animation-name: toastInBottom;
  }

  .toast-leave-active {
    animation-name: toastInBottom;
  }

  @keyframes toastInBottom {
    from {
      opacity: 0;
      transform: translate(-50%, 22px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
}
</style>
