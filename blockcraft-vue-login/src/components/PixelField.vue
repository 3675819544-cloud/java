<script setup>
import { computed } from 'vue'

/**
 * 表单字段容器：标签 + 控件插槽 + 错误提示
 * 只负责排版与错误文案展示，控件本身由插槽传入。
 */
const props = defineProps({
  /** 输入控件的 id，同时派生出错误提示的 id */
  fieldId: { type: String, required: true },
  label: { type: String, default: '' },
  error: { type: String, default: '' },
})

const errorId = computed(() => `${props.fieldId}Error`)
</script>

<template>
  <div class="field">
    <label v-if="label" class="field-label" :for="fieldId">{{ label }}</label>

    <slot />

    <!-- 始终占位（min-height），避免出现错误时整块面板跳动 -->
    <p :id="errorId" class="field-error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
}

.field-label {
  margin-bottom: 7px;
  font-size: 12px;
  color: var(--ink);
  /* 石头按钮同款文字浮雕 */
  text-shadow: var(--ink-emboss);
}

.field-error {
  min-height: 16px;
  margin-top: 5px;
  font-size: 11px;
  color: var(--danger);
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.7);
}
</style>
