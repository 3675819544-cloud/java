<script setup>
/**
 * 像素风物品方块
 * 经典 Minecraft 物品槽：深色底槽 + 受光/背光立体边；物品本体在底色之上叠了
 * 受光面 / 背光面渐变与一层像素噪点纹理，模拟方块的高光、暗面与颗粒感。
 * 空槽（item 为 null）只渲染空底槽。
 */
import { computed } from 'vue'
import { ITEMS } from '@/data/recipes'

const props = defineProps({
  /** 物品 key（对应 ITEMS），为 null / 空表示空格 */
  item: { type: String, default: null },
  /** 方块边长（px） */
  size: { type: Number, default: 40 },
  /** 是否显示中文短标签 */
  showLabel: { type: Boolean, default: true },
})

const meta = computed(() => (props.item ? ITEMS[props.item] : null))
</script>

<template>
  <div
    class="slot"
    :class="{ empty: !meta }"
    :style="{ width: size + 'px', height: size + 'px' }"
    :title="meta ? meta.name : ''"
  >
    <div v-if="meta" class="block" :style="{ '--c': meta.color }">
      <span v-if="showLabel" class="label">{{ meta.name }}</span>
    </div>
  </div>
</template>

<style scoped>
.slot {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--slot);
  border: 2px solid #000;
  /* 底槽立体边：左上受光、右下背光 */
  box-shadow: inset 2px 2px 0 rgba(255, 255, 255, 0.18),
    inset -2px -2px 0 rgba(0, 0, 0, 0.55);
}

/* 空槽也铺一层极淡网格，更像 MC 的物品栏空格 */
.slot.empty::after {
  content: '';
  position: absolute;
  inset: 3px;
  background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.18) 1px, transparent 1px);
  background-size: 6px 6px;
}

.block {
  position: relative;
  width: 78%;
  height: 78%;
  background-color: var(--c);
  /* 受光面（左上更亮）+ 背光面（右下更暗），形成方块立体感 */
  background-image: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.32),
      rgba(255, 255, 255, 0) 44%
    ),
    linear-gradient(315deg, rgba(0, 0, 0, 0.34), rgba(0, 0, 0, 0) 46%);
  /* 物品本体立体边：模拟方块高光与暗面 */
  box-shadow: inset 2px 2px 0 rgba(255, 255, 255, 0.24),
    inset -2px -2px 0 rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  image-rendering: pixelated;
}

/* 像素噪点纹理层：让方块表面有颗粒感，而非纯色块 */
.block::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.12) 1px, transparent 1px);
  background-size: 5px 5px;
  mix-blend-mode: overlay;
  pointer-events: none;
}

.label {
  position: relative;
  z-index: 1;
  font-family: var(--font);
  font-size: 8px;
  line-height: 1;
  color: #fff;
  text-shadow: 1px 1px 0 #000;
  padding-bottom: 2px;
  white-space: nowrap;
}
</style>
