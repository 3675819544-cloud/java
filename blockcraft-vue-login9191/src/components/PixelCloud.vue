<script setup>
import { computed } from 'vue'

/**
 * 像素云朵
 * 原 HTML 里三段几乎相同的 <svg>，改用「数据 + v-for」渲染，
 * 每个矩形是一个 [x, y, width, height] 元组。
 */
const props = defineProps({
  /** 云朵造型：1 / 2 / 3 */
  variant: { type: Number, default: 1, validator: (v) => [1, 2, 3].includes(v) },
})

const SHAPES = {
  1: [
    [3, 6, 7, 4],
    [9, 3, 8, 7],
    [6, 9, 12, 3],
    [17, 6, 5, 3],
    [11, 1, 5, 3],
  ],
  2: [
    [4, 7, 6, 3],
    [10, 4, 9, 6],
    [7, 10, 13, 2],
    [19, 6, 4, 4],
  ],
  3: [
    [2, 5, 9, 5],
    [8, 2, 7, 8],
    [5, 9, 14, 3],
  ],
}

const rects = computed(() => SHAPES[props.variant] ?? SHAPES[1])
</script>

<template>
  <svg
    class="cloud"
    :class="`cloud-${variant}`"
    viewBox="0 0 24 14"
    shape-rendering="crispEdges"
    aria-hidden="true"
  >
    <rect
      v-for="([x, y, w, h], index) in rects"
      :key="index"
      :x="x"
      :y="y"
      :width="w"
      :height="h"
    />
  </svg>
</template>

<style scoped>
/* 云：白色像素块 + 缓慢横向漂移 */
.cloud {
  position: absolute;
  fill: #ffffff;
  opacity: 0.9;
  filter: drop-shadow(4px 4px 0 rgba(70, 110, 170, 0.25));
  animation: drift linear infinite;
  will-change: transform;
}

.cloud-1 {
  width: 190px;
  top: 12%;
  animation-duration: 90s;
}

.cloud-2 {
  width: 140px;
  top: 30%;
  opacity: 0.75;
  animation-duration: 130s;
  animation-delay: -40s;
}

.cloud-3 {
  width: 240px;
  top: 5%;
  opacity: 0.6;
  animation-duration: 160s;
  animation-delay: -90s;
}

/* keyframes 必须定义在使用它的组件内，
   否则 scoped 编译会把 animation 名重命名后找不到对应关键帧 */
@keyframes drift {
  from {
    transform: translateX(-30vw);
  }
  to {
    transform: translateX(115vw);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cloud {
    animation: none;
  }
}
</style>
