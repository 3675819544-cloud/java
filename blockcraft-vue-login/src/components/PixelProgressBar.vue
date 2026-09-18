<script setup>
import { computed } from 'vue'

import { PROGRESS_TEXT } from '@/constants/site'

/**
 * 像素进度条（「加载世界中…」）
 * percent 由外部驱动，纯展示组件。
 */
const props = defineProps({
  percent: { type: Number, default: 0 },
})

const text = computed(() =>
  props.percent < 100
    ? PROGRESS_TEXT.loading(props.percent)
    : PROGRESS_TEXT.done,
)
</script>

<template>
  <span class="progress">
    <span class="bar">
      <span class="bar-fill" :style="{ width: `${percent}%` }"></span>
    </span>
    <span class="bar-text">{{ text }}</span>
  </span>
</template>

<style scoped>
.progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
}

.bar {
  width: 62%;
  height: 12px;
  background: var(--gui-line);
  border: 2px solid;
  border-color: var(--btn-edge) #e0e0e0 #e0e0e0 var(--btn-edge);
}

.bar-fill {
  display: block;
  width: 0;
  height: 100%;
  background: var(--accent);
  /* 进度条格子纹理 */
  background-image: repeating-linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.18) 0 4px,
    transparent 4px 8px
  );
}

.bar-text {
  font-size: 9px;
  color: #fff;
  text-shadow: 1px 1px 0 var(--ink);
}
</style>
