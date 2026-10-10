<script setup>
import GuiPanel from '@/components/GuiPanel.vue'
import RegisterForm from '@/components/RegisterForm.vue'
import { SITE } from '@/constants/site'
</script>

<template>
  <!-- 单根包裹：router-view 外层的 <Transition> 要求页面组件只有一个根节点 -->
  <div class="view">
    <p class="subtitle">{{ SITE.registerSubtitle }}</p>

    <GuiPanel :title="SITE.registerPanelTitle">
      <RegisterForm />
    </GuiPanel>
  </div>
</template>
