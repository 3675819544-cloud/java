<script setup>
import BackgroundScene from '@/components/BackgroundScene.vue'
import CreeperLogo from '@/components/CreeperLogo.vue'
import PixelToast from '@/components/PixelToast.vue'
import { SITE } from '@/constants/site'
import { useToast } from '@/composables/useToast'

/**
 * 页面外壳：背景场景 + 标题区 + 角落 HUD
 * 真正成为「页面」的内容（登录 / 注册表单）由 <router-view> 注入，
 * 成功提示统一走全局 useToast，由这里的 <PixelToast> 展示。
 */
const { state } = useToast()
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

    <!-- 登录 / 注册视图注入点 -->
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </main>

  <!-- 角落 HUD 文字（主菜单同款） -->
  <p class="hud hud-left">{{ SITE.hudLeft }}</p>
  <p class="hud hud-right">{{ SITE.hudRight }}</p>

  <!-- 成功 / 提示 -->
  <PixelToast :message="state.message" :visible="state.visible" />
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

/* ---------------- 页面切换：像素阶梯位移 ---------------- */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s steps(3, end), transform 0.18s steps(3, end);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
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
}
</style>
