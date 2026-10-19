<script setup>
/**
 * 配方详情弹窗
 * 大号 3×3 合成网格 + 材料清单（去重求和）+ 产物 + 说明 + 关闭按钮。
 * 外观沿用 GuiPanel 同款像素立体边，以遮罩形式居中浮层展示。
 */
import { computed } from 'vue'
import MinecraftItem from '@/components/MinecraftItem.vue'
import { ITEMS } from '@/data/recipes'

const props = defineProps({
  recipe: { type: Object, default: null },
})

const emit = defineEmits(['close'])

/** 把 3×3 网格里的材料汇总成「材料 -> 数量」清单（空格忽略） */
const materials = computed(() => {
  if (!props.recipe) return []
  const map = {}
  for (const cell of props.recipe.grid) {
    if (!cell) continue
    map[cell] = (map[cell] || 0) + 1
  }
  return Object.entries(map).map(([key, count]) => ({
    key,
    count,
    name: ITEMS[key]?.name || key,
  }))
})
</script>

<template>
  <Transition name="modal">
    <div v-if="recipe" class="overlay" @click.self="emit('close')">
      <div class="dialog" role="dialog" aria-modal="true">
        <div class="head">
          <h3 class="title">{{ recipe.name }}</h3>
          <button class="close" type="button" aria-label="关闭" @click="emit('close')">
            ✕
          </button>
        </div>

        <div class="body">
          <div class="craft-big">
            <div class="grid">
              <MinecraftItem
                v-for="(cell, i) in recipe.grid"
                :key="i"
                :item="cell"
                :size="56"
              />
            </div>

            <svg class="arrow" viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">
              <rect x="0" y="5" width="7" height="2" fill="#ffffff" />
              <rect x="7" y="4" width="2" height="4" fill="#ffffff" />
              <rect x="9" y="3" width="2" height="6" fill="#ffffff" />
            </svg>

            <div class="result">
              <MinecraftItem :item="recipe.result" :size="72" :show-label="false" />
              <span class="count">×{{ recipe.count }}</span>
              <span class="rname">{{ ITEMS[recipe.result]?.name }}</span>
            </div>
          </div>

          <div class="meta">
            <div class="row">
              <span class="k">分类</span>
              <span class="v cat">{{ recipe.category }}</span>
            </div>
            <div class="row">
              <span class="k">产出</span>
              <span class="v">{{ ITEMS[recipe.result]?.name }} ×{{ recipe.count }}</span>
            </div>
            <div class="row materials">
              <span class="k">材料</span>
              <span class="v list">
                <span v-for="m in materials" :key="m.key" class="chip">
                  {{ m.name }} ×{{ m.count }}
                </span>
              </span>
            </div>
            <p class="tip">{{ recipe.tip }}</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.55);
}

.dialog {
  width: min(100%, 560px);
  max-height: 88vh;
  overflow: auto;
  background: var(--gui);
  border: 3px solid var(--gui-line);
  box-shadow: inset 3px 3px 0 var(--gui-hi), inset -3px -3px 0 var(--gui-lo),
    6px 6px 0 rgba(0, 0, 0, 0.4);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--gui-dark);
  border-bottom: 3px solid var(--gui-dark-line);
  box-shadow: inset 0 3px 0 #5a5a5a;
}

.title {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.12em;
  color: #fff;
  text-shadow: 2px 2px 0 var(--gui-line);
}

.close {
  font-family: var(--font);
  font-size: 12px;
  color: #fff;
  background: var(--btn);
  border: 2px solid;
  border-color: var(--gui-hi) var(--btn-edge) var(--btn-edge) var(--gui-hi);
  width: 30px;
  height: 26px;
  cursor: pointer;
}

.close:hover {
  background: var(--btn-hover);
  color: var(--btn-highlight);
}

.close:active {
  border-color: var(--btn-edge) var(--gui-hi) var(--gui-hi) var(--btn-edge);
}

.body {
  padding: 18px var(--panel-pad);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.craft-big {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 56px);
  grid-template-rows: repeat(3, 56px);
  gap: 4px;
  padding: 8px;
  background: #5a5a5a;
  border: 2px solid #000;
  box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.4);
}

.arrow {
  width: 30px;
  height: 30px;
  flex: none;
  filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.4));
}

.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 12px;
  background: #5a5a5a;
  border: 2px solid #000;
  box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.4);
}

.count {
  font-family: var(--font);
  font-size: 11px;
  color: #fff;
  text-shadow: 1px 1px 0 #000;
}

.rname {
  font-size: 11px;
  color: #fff;
  text-shadow: 1px 1px 0 #000;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 2px dashed #a8a8a8;
}

.k {
  flex: none;
  width: 48px;
  font-size: 12px;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
}

.v {
  font-size: 12px;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
}

.cat {
  width: auto;
  color: #fff;
  background: var(--accent);
  padding: 2px 8px;
  border: 2px solid var(--grass-line);
  text-shadow: 1px 1px 0 var(--grass-line);
}

.list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  font-size: 11px;
  color: #fff;
  background: #5a5a5a;
  padding: 3px 8px;
  border: 2px solid #2a2a2a;
}

.tip {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
  background: var(--accent-soft);
  border-left: 4px solid var(--accent);
  padding: 10px 12px;
}

/* 弹窗过渡：像素阶梯淡入 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.16s steps(3, end);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
