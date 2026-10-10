<script setup>
import { onMounted, ref } from 'vue'

/**
 * 图片验证码（Canvas 绘制，无第三方依赖）
 *
 * - 生成 4 位「字母 + 数字」随机码，像素风绘制在黑色凹槽里
 * - 叠加干扰线 / 噪点，保留验证码应有的「机器难认、人能读」特性
 * - 点击图片或「换一张」按钮刷新
 * - 通过 `change` 事件把当前正确码抛给父组件做校验
 *
 * 设计上贴合 MC 像素风：用等宽字体、关闭抗锯齿、配色取自设计令牌。
 */

const emit = defineEmits(['change'])

/** 可选字符：去掉易混的 0/O、1/I/L */
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const LENGTH = 4

const canvas = ref(null)
/** 当前正确码，父组件比对时用 */
const code = ref('')

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

function generate() {
  let next = ''
  for (let i = 0; i < LENGTH; i++) next += randomChar()
  code.value = next
  draw(next)
  emit('change', next)
}

/**
 * 在 canvas 上绘制验证码
 * 用 2x 物理像素缩放，配合 image-rendering: pixelated 得到硬边像素感。
 */
function draw(text) {
  const cv = canvas.value
  if (!cv) return

  const w = 120
  const h = 46
  const dpr = 2
  cv.width = w * dpr
  cv.height = h * dpr
  cv.style.width = `${w}px`
  cv.style.height = `${h}px`

  const ctx = cv.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = false

  // 凹槽黑底
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, w, h)

  // 噪点（随机亮色像素，干扰 OCR）
  const noiseColors = ['#3a3a3a', '#4c4c4c', '#5a5a5a']
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = noiseColors[Math.floor(Math.random() * noiseColors.length)]
    ctx.fillRect(Math.floor(Math.random() * w), Math.floor(Math.random() * h), 1, 1)
  }

  // 干扰线（3 条，随机颜色）
  const lineColors = ['#6ee04f', '#5b8dd9', '#ffff55', '#74c042']
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = lineColors[Math.floor(Math.random() * lineColors.length)]
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(Math.random() * w, Math.random() * h)
    ctx.lineTo(Math.random() * w, Math.random() * h)
    ctx.stroke()
  }

  // 逐字符绘制，带随机偏移与颜色，增加辨识难度
  const charColors = ['#6ee04f', '#cfe3ff', '#ffff55', '#74c042', '#ffffff']
  ctx.textBaseline = 'middle'
  ctx.font = 'bold 22px "Press Start 2P", monospace'

  const step = w / (text.length + 1)
  for (let i = 0; i < text.length; i++) {
    const x = step * (i + 1)
    const y = h / 2 + (Math.random() * 8 - 4)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((Math.random() - 0.5) * 0.5)
    ctx.fillStyle = charColors[Math.floor(Math.random() * charColors.length)]
    // 左对齐锚点，逐个居中
    ctx.fillText(text[i], -11, 0)
    ctx.restore()
  }
}

onMounted(generate)

/** 暴露给父组件，答错验证码时主动刷新 */
defineExpose({ refresh: generate })
</script>

<template>
  <button
    type="button"
    class="captcha"
    aria-label="点击刷新验证码"
    @click="generate"
  >
    <canvas ref="canvas" class="captcha-canvas" />
    <span class="captcha-refresh">换一张</span>
  </button>
</template>

<style scoped>
.captcha {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
}

/* 验证码画布：复用 MC 文本凹槽质感 */
.captcha-canvas {
  width: 120px;
  height: 46px;
  border: 2px solid;
  border-color: var(--slot-lo) var(--slot-hi) var(--slot-hi) var(--slot-lo);
  image-rendering: pixelated;
}

.captcha-refresh {
  font-size: 11px;
  color: var(--link);
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.6);
  border-bottom: 2px solid var(--link-underline);
}

.captcha-refresh:hover {
  color: var(--link-hover);
  border-bottom-color: var(--link-hover);
}
</style>
