<script setup>
/**
 * 自定义像素复选框
 * 隐藏原生 input 保留可访问性，用黑底方框 + 绿色对勾绘制外观。
 */
defineProps({
  fieldId: { type: String, required: true },
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

function onChange(event) {
  emit('update:modelValue', event.target.checked)
}
</script>

<template>
  <label class="check" :for="fieldId">
    <input
      :id="fieldId"
      class="check-input"
      type="checkbox"
      :checked="modelValue"
      @change="onChange"
    />

    <span class="check-box">
      <svg viewBox="0 0 20 20" shape-rendering="crispEdges">
        <path
          d="M3 10 L7 14 L16 4"
          fill="none"
          stroke="#6ee04f"
          stroke-width="4"
        />
      </svg>
    </span>

    <span class="check-text">{{ label }}</span>
  </label>
</template>

<style scoped>
.check {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  user-select: none;
}

.check-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.check-box {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  background: var(--slot);
  border: 2px solid;
  border-color: var(--slot-lo) var(--slot-hi) var(--slot-hi) var(--slot-lo);
}

.check-box svg {
  width: 14px;
  height: 14px;
  opacity: 0;
  transition: opacity 0.08s steps(1, end);
}

.check-input:checked + .check-box svg {
  opacity: 1;
}

.check-input:focus-visible + .check-box {
  box-shadow: 0 0 0 2px var(--accent-ring);
}

.check-text {
  font-size: 12px;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
}
</style>
