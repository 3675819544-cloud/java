<script setup>
import { computed, ref } from 'vue'

/**
 * 像素风输入框
 * 黑色凹陷槽（上/左深、下/右亮），聚焦整槽转草绿描边。
 * 通过 defineExpose 暴露 focus()，让父组件能在校验失败时把光标送回输入框。
 */
const props = defineProps({
  fieldId: { type: String, required: true },
  modelValue: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  /** 校验失败时切红框 */
  invalid: { type: Boolean, default: false },
  /** 是否渲染右侧「显示 / 隐藏」小按钮 */
  toggleable: { type: Boolean, default: false },
  toggleLabel: { type: String, default: '显示' },
})

const emit = defineEmits(['update:modelValue', 'blur', 'input', 'toggle'])

const inputEl = ref(null)

const errorId = computed(() => `${props.fieldId}Error`)

function focus() {
  inputEl.value?.focus()
}

function onInput(event) {
  emit('update:modelValue', event.target.value)
  // 单独抛一个 input 事件，方便父组件做「输入即清除错误」这类副作用
  emit('input', event.target.value)
}

defineExpose({ focus })
</script>

<template>
  <div class="slot" :class="{ 'has-error': invalid }">
    <input
      :id="fieldId"
      ref="inputEl"
      class="input"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :aria-invalid="invalid ? 'true' : null"
      :aria-describedby="errorId"
      @input="onInput"
      @blur="emit('blur')"
    />

    <!-- 显示 / 隐藏密码：迷你 GUI 按钮 -->
    <button
      v-if="toggleable"
      type="button"
      class="btn-toggle"
      :aria-label="`${toggleLabel}密码`"
      @click="emit('toggle')"
    >
      {{ toggleLabel }}
    </button>
  </div>
</template>

<style scoped>
/* 输入槽：黑色凹陷，模拟 MC 文本框 */
.slot {
  display: flex;
  align-items: center;
  height: 46px;
  padding: 0 6px 0 12px;
  background: var(--slot);
  border: 2px solid;
  /* 上/左深、下/右亮 = 凹陷 */
  border-color: var(--slot-lo) var(--slot-hi) var(--slot-hi) var(--slot-lo);
  transition: border-color 0.12s steps(2, end);
}

.slot:hover {
  border-color: #a8a8a8 var(--slot-hi) var(--slot-hi) #a8a8a8;
}

/* 聚焦：整槽换绿色描边（草绿/经验条色） */
.slot:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}

/* 校验失败：红色描边 */
.slot.has-error,
.slot.has-error:focus-within {
  border-color: var(--danger);
  box-shadow: 0 0 0 2px var(--danger-soft);
}

.input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  color: #fff;
  caret-color: var(--accent);
  letter-spacing: 0.04em;
}

.input::placeholder {
  color: var(--slot-placeholder);
}

.input::selection {
  background: var(--slot-selection);
}

/* 显示/隐藏密码 */
.btn-toggle {
  flex: none;
  height: 32px;
  padding: 0 10px;
  font-size: 11px;
  color: #fff;
  text-shadow: 1px 1px 0 var(--ink);
  background: var(--btn);
  border: 2px solid;
  border-color: var(--gui-hi) var(--btn-edge) var(--btn-edge) var(--gui-hi);
  cursor: pointer;
}

.btn-toggle:hover {
  background: var(--btn-hover);
}

.btn-toggle:active {
  border-color: var(--btn-edge) var(--gui-hi) var(--gui-hi) var(--btn-edge);
}

.btn-toggle:focus-visible {
  outline: 2px solid var(--btn-highlight);
  outline-offset: 1px;
}
</style>
