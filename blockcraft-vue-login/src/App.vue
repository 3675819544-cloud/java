<script setup>
import { onBeforeUnmount, ref } from 'vue'

import BackgroundScene from '@/components/BackgroundScene.vue'
import CreeperLogo from '@/components/CreeperLogo.vue'
import GuiPanel from '@/components/GuiPanel.vue'
import LoginForm from '@/components/LoginForm.vue'
import PixelToast from '@/components/PixelToast.vue'
import { SITE } from '@/constants/site'

/**
 * 页面外壳：背景场景 + 标题区 + 登录面板 + 角落 HUD
 * 登录结果由 LoginForm 抛出，这里统一负责提示（替代原来的 alert）。
 */
const toastVisible = ref(false)
const toastMessage = ref('')
let toastTimer = null

function handleSuccess() {
  toastMessage.value = SITE.successMessage
  toastVisible.value = true

  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toastVisible.value = false
  }, 2800)
}

onBeforeUnmount(() => window.clearTimeout(toastTimer))
</script>

<template>
  <!-- 背景场景（纯装饰） -->
  <BackgroundScene />

  <!-- 主体 -->
  <main class="wrap">
    <header class="logo-row">
      <CreeperLogo />
      <h1 class="brand">{{ SITE.brand }}</h1>

      <!-- 主菜单同款斜体黄色 splash 文字 -->
      <span class="splash">{{ SITE.splash }}</span>
    </header>

    <p class="subtitle">{{ SITE.subtitle }}</p>

    <GuiPanel :title="SITE.panelTitle">
      <LoginForm @success="handleSuccess" />
    </GuiPanel>
  </main>

  <!-- 角落 HUD 文字（主菜单同款） -->
  <p class="hud hud-left">{{ SITE.hudLeft }}</p>
  <p class="hud hud-right">{{ SITE.hudRight }}</p>

  <!-- 登录成功提示 -->
  <PixelToast :message="toastMessage" :visible="toastVisible" />
</template>

<style scoped>
.wrap {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 48px 20px 180px;
}

/* ---------------- 标题区 ---------------- */
.logo-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand {
  font-size: 30px;
  line-height: 1;
  letter-spacing: 0.02em;
  color: #fff;
  text-shadow: var(--shadow-lg);
}

/* 主菜单同款黄色斜体 splash */
.splash {
  position: absolute;
  right: -18px;
  bottom: -22px;
  font-size: 11px;
  color: var(--splash);
  text-shadow: 2px 2px 0 var(--ink);
  transform: rotate(-14deg);
  transform-origin: center;
  animation: pulse 1.1s ease-in-out infinite;
  white-space: nowrap;
}

.subtitle {
  margin-top: 26px;
  font-size: 12px;
  color: #fff;
  text-shadow: var(--shadow);
}

/* ---------------- 角落 HUD ---------------- */
.hud {
  position: fixed;
  bottom: 8px;
  z-index: 2;
  font-size: 9px;
  color: #fff;
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.55);
  pointer-events: none;
}

.hud-left {
  left: 10px;
}

.hud-right {
  right: 10px;
}

@keyframes pulse {
  0%,
  100% {
    transform: rotate(-14deg) scale(1);
  }
  50% {
    transform: rotate(-14deg) scale(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .splash {
    animation: none;
  }
}

/* ---------------- 响应式 ---------------- */
@media (max-width: 640px) {
  .wrap {
    padding: 32px 14px 150px;
  }

  .brand {
    font-size: 22px;
  }

  .splash {
    font-size: 10px;
    right: -6px;
    bottom: -18px;
  }

  .hud-right {
    display: none;
  }
}

@media (max-width: 380px) {
  .brand {
    font-size: 18px;
  }

  .subtitle {
    font-size: 11px;
  }
}
</style>
