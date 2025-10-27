<script setup>
import AppHeader from "./AppHeader.vue"
const emits = defineEmits(['onOpen'])

const onClick = ()=>{
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
<div class="page-content">
<AppHeader
    @on-change="onClick"
/>
  <div id="layout-header-tab"></div>

  <div :class="mainContentClass" id="mainContent">
    <router-view v-slot="{ Component }">
      <transition name="slide-right" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</div>
</template>
