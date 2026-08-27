<script setup>
  import AppHeader from './AppHeader.vue'
  import { useAppStore } from '@/store/modules/index.js'
  // eimzoGate ulanishi (olib tashlashda o'chadi).
  import EimzoGate from '@/features/eimzoGate/EimzoGate.vue'

  const appStore = useAppStore()
  const emits = defineEmits(['onOpen'])

  const onClick = () => {
    emits('onOpen')
  }

  const mainContentClass = computed(() => {
    return appStore.hasTeleportedContent ? 'main-content-with-tabs' : 'main-content'
  })
</script>

<template>
  <div class="page-content flex flex-col">
    <AppHeader @on-change="onClick" />
    <div id="layout-header-tab"></div>

    <div :class="mainContentClass" id="mainContent" class="flex-1 flex flex-col relative">
      <router-view v-slot="{ Component, route }">
        <transition name="slide-right" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
      <!-- eimzoGate: olib tashlashda shu teg va yuqoridagi import o'chiriladi. -->
      <EimzoGate />
    </div>
  </div>
</template>
