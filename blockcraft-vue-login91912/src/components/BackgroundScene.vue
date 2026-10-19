<script setup>
import FloatingBlock from '@/components/FloatingBlock.vue'
import PixelCloud from '@/components/PixelCloud.vue'

/**
 * 背景场景：天空 + 云 + 悬浮方块 + 草地
 * 纯装饰层（pointer-events: none），不参与交互。
 */
</script>

<template>
  <div class="scene" aria-hidden="true">
    <!-- 云朵 -->
    <PixelCloud :variant="1" />
    <PixelCloud :variant="2" />
    <PixelCloud :variant="3" />

    <!-- 悬浮草方块 -->
    <FloatingBlock :variant="1" />
    <FloatingBlock :variant="2" />
    <FloatingBlock :variant="3" />

    <!-- 地面：草皮层 + 泥土层 -->
    <div class="ground">
      <div class="grass-layer"></div>
      <div class="dirt-layer"></div>
    </div>
  </div>
</template>

<style scoped>
.scene {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

/* 天空渐变 */
.scene::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    var(--sky-top) 0%,
    var(--sky-mid) 42%,
    var(--sky-low) 78%,
    var(--sky-bottom) 100%
  );
}

.ground {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 120px;
}

.grass-layer {
  height: 22px;
  background: var(--grass);
  background-image: repeating-conic-gradient(
    rgba(255, 255, 255, 0.14) 0% 25%,
    transparent 0% 50%
  );
  background-size: 16px 16px;
  border-bottom: 5px solid var(--grass-line);
}

.dirt-layer {
  height: calc(100% - 22px);
  background: var(--dirt);
  background-image: repeating-conic-gradient(
      rgba(0, 0, 0, 0.12) 0% 25%,
      transparent 0% 50%
    ),
    repeating-conic-gradient(
      rgba(255, 255, 255, 0.06) 0% 25%,
      transparent 0% 50%
    );
  background-size: 20px 20px, 40px 40px;
  background-position: 0 0, 10px 10px;
}

@media (max-width: 640px) {
  .ground {
    height: 96px;
  }
}
</style>
