<script setup>
/**
 * 苦力怕脸 Logo
 * 8×8 像素画：一张底 + 若干黑色矩形拼出表情。
 */
</script>

<template>
  <span class="creeper" aria-hidden="true">
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
</template>

<style scoped>
.creeper {
  display: block;
  width: 44px;
  height: 44px;
  flex: none;
  border: 3px solid var(--gui-line);
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.28);
}

.creeper svg {
  width: 100%;
  height: 100%;
}

@media (max-width: 640px) {
  .creeper {
    width: 34px;
    height: 34px;
  }
}
</style>
