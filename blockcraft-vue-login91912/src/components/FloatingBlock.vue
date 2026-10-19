<script setup>
/**
 * 悬浮草方块（纯装饰）
 * 方块本体 + ::before 草皮顶面，位置/尺寸/浮动节奏由 variant 决定。
 */
defineProps({
  /** 造型：1 / 2 / 3，对应左右两侧与左下角的三个装饰方块 */
  variant: { type: Number, default: 1, validator: (v) => [1, 2, 3].includes(v) },
})
</script>

<template>
  <div class="block" :class="`block-${variant}`" aria-hidden="true"></div>
</template>

<style scoped>
.block {
  position: absolute;
  width: 44px;
  height: 44px;
  background: var(--dirt);
  /* 泥土像素噪点 */
  background-image: repeating-conic-gradient(
    rgba(0, 0, 0, 0.12) 0% 25%,
    transparent 0% 50%
  );
  background-size: 16px 16px;
  border: 3px solid;
  border-color: var(--dirt) var(--dirt-dark) var(--dirt-dark) var(--dirt);
  animation: bob ease-in-out infinite;
}

/* 草皮顶面 */
.block::before {
  content: "";
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  height: 15px;
  background: var(--grass);
  background-image: repeating-conic-gradient(
    rgba(255, 255, 255, 0.16) 0% 25%,
    transparent 0% 50%
  );
  background-size: 10px 10px;
  border-bottom: 3px solid var(--grass-line);
}

.block-1 {
  left: 12%;
  top: 24%;
  animation-duration: 4.4s;
}

.block-2 {
  right: 13%;
  top: 38%;
  width: 34px;
  height: 34px;
  animation-duration: 5.6s;
  animation-direction: reverse;
}

.block-3 {
  left: 20%;
  bottom: 20%;
  width: 28px;
  height: 28px;
  animation-duration: 6.8s;
}

@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

/* 窄屏隐藏两侧方块，避免与面板打架 */
@media (max-width: 900px) {
  .block-1,
  .block-3 {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .block {
    animation: none;
  }
}
</style>
