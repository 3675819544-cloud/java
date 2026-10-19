<script setup>
/**
 * 单个合成配方卡片
 * 左侧 3×3 合成网格 -> 箭头 -> 产物方块（带数量），下方名称 / 分类 / 小贴士。
 * 整卡可点击，向上 emit「open」事件，由父级弹出详情；右上角星星可收藏（emit「fav」）。
 */
import MinecraftItem from '@/components/MinecraftItem.vue'

const props = defineProps({
  recipe: { type: Object, required: true },
  /** 是否已收藏 */
  faved: { type: Boolean, default: false },
})

const emit = defineEmits(['open', 'fav'])

function open() {
  emit('open', props.recipe)
}
</script>

<template>
  <article class="recipe" tabindex="0" role="button" @click="open" @keydown.enter="open">
    <button
      class="fav"
      :class="{ on: faved }"
      type="button"
      :aria-label="faved ? '取消收藏' : '收藏'"
      @click.stop="emit('fav', recipe)"
    >
      {{ faved ? '★' : '☆' }}
    </button>

    <div class="craft">
      <div class="grid">
        <MinecraftItem
          v-for="(cell, i) in recipe.grid"
          :key="i"
          :item="cell"
          :size="40"
        />
      </div>

      <svg class="arrow" viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">
        <rect x="0" y="5" width="7" height="2" fill="#ffffff" />
        <rect x="7" y="4" width="2" height="4" fill="#ffffff" />
        <rect x="9" y="3" width="2" height="6" fill="#ffffff" />
      </svg>

      <div class="result">
        <MinecraftItem :item="recipe.result" :size="52" />
        <span class="count">×{{ recipe.count }}</span>
      </div>
    </div>

    <h3 class="name">{{ recipe.name }}</h3>
    <span class="cat">{{ recipe.category }}</span>
    <p class="tip">{{ recipe.tip }}</p>

    <span class="more">查看配方 ▸</span>
  </article>
</template>

<style scoped>
.recipe {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  background: var(--gui);
  border: 3px solid var(--gui-line);
  box-shadow: inset 3px 3px 0 var(--gui-hi), inset -3px -3px 0 var(--gui-lo),
    4px 4px 0 rgba(0, 0, 0, 0.25);
  cursor: pointer;
  outline: none;
  transition: transform 0.08s steps(2, end), box-shadow 0.08s steps(2, end);
}

.recipe:hover,
.recipe:focus-visible {
  transform: translate(-1px, -1px);
  box-shadow: inset 3px 3px 0 var(--gui-hi), inset -3px -3px 0 var(--gui-lo),
    0 0 0 3px var(--accent-ring), 5px 5px 0 rgba(0, 0, 0, 0.3);
}

.recipe:active {
  transform: translate(1px, 1px);
}

.fav {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  line-height: 1;
  color: #fff;
  background: rgba(0, 0, 0, 0.35);
  border: 2px solid #000;
  cursor: pointer;
  text-shadow: 1px 1px 0 #000;
}

.fav:hover {
  background: rgba(0, 0, 0, 0.55);
}

.fav.on {
  color: var(--splash);
  background: rgba(0, 0, 0, 0.5);
}

.craft {
  display: flex;
  align-items: center;
  gap: 10px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 40px);
  grid-template-rows: repeat(3, 40px);
  gap: 3px;
  padding: 6px;
  background: #5a5a5a;
  border: 2px solid #000;
  box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.4);
}

.arrow {
  width: 26px;
  height: 26px;
  flex: none;
  filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.4));
}

.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  background: #5a5a5a;
  border: 2px solid #000;
  box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.4);
}

.count {
  font-family: var(--font);
  font-size: 10px;
  color: #fff;
  text-shadow: 1px 1px 0 #000;
}

.name {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.08em;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
}

.cat {
  align-self: flex-start;
  font-size: 10px;
  color: #fff;
  background: var(--accent);
  padding: 2px 6px;
  border: 2px solid var(--grass-line);
  text-shadow: 1px 1px 0 var(--grass-line);
}

.tip {
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
  flex: 1;
}

.more {
  align-self: flex-end;
  font-size: 10px;
  color: var(--link);
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
}

.recipe:hover .more {
  color: var(--link-hover);
}
</style>
