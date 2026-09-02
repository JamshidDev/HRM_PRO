<script setup>
  import AppHeader from './AppHeader.vue'
  import { useAppStore } from '@/store/modules/index.js'

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
    </div>
  </div>
</template>
