<script setup>
/**
 * Minecraft GUI 风格面板
 * 经典立体边：左上受光、右下背光；顶部一条深色标题条。
 */
defineProps({
  /** 标题条文字，为空则不渲染标题条 */
  title: { type: String, default: '' },
})
</script>

<template>
  <section class="panel">
    <div v-if="title" class="panel-head">
      <h2 class="panel-title">{{ title }}</h2>
    </div>

    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.panel {
  width: min(100%, var(--panel-width));
  margin-top: 22px;
  padding: 12px 0 24px;
  background: var(--gui);
  border: 3px solid var(--gui-line);
  /* 经典 GUI 立体边：左上受光、右下背光 */
  box-shadow: inset 3px 3px 0 var(--gui-hi), inset -3px -3px 0 var(--gui-lo),
    8px 8px 0 rgba(0, 0, 0, 0.3);
  animation: panelIn 0.35s steps(6, end) both;
}

/* 深色标题条（占满宽度，保留上下 GUI 立体边） */
.panel-head {
  margin-bottom: 22px;
  padding: 12px var(--panel-pad);
  background: var(--gui-dark);
  border-top: 3px solid var(--gui-dark-line);
  border-bottom: 3px solid var(--gui-dark-line);
  box-shadow: inset 0 3px 0 #5a5a5a;
}

.panel-title {
  font-size: 12px;
  letter-spacing: 0.16em;
  text-align: center;
  color: #fff;
  text-shadow: 2px 2px 0 var(--gui-line);
}

.panel-body {
  padding: 0 var(--panel-pad);
}

@keyframes panelIn {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 380px) {
  .panel-title {
    font-size: 11px;
    letter-spacing: 0.08em;
  }
}
</style>
