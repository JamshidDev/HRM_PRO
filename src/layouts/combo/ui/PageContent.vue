<script setup>
  import AppHeader from './AppHeader.vue'
  const emits = defineEmits(['onOpen'])

  const onClick = () => {
    emits('onOpen')
  }
  const hasTeleportedContent = ref(false)

  const mainContentClass = computed(() => {
    return hasTeleportedContent.value ? 'main-content-with-tabs' : 'main-content'
  })

  onMounted(() => {
    window.addEventListener('teleport-changed', (e) => {
      hasTeleportedContent.value = e.detail?.hasContent || false
    })
  })
</script>

<template>
  <div class="page-content flex flex-col">
    <AppHeader @on-change="onClick" />
    <div id="layout-header-tab"></div>

    <div :class="mainContentClass" id="mainContent" class="flex-1 flex flex-col">
      <router-view v-slot="{ Component, route }">
        <transition name="slide-right" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>
  </div>
</template>
