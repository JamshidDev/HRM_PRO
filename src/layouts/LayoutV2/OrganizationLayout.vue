<script setup>
import SidebarContent from "./ui/SidebarContent.vue";
import PageContent from "./ui/PageContent.vue";

const open = ref(true)

const layoutClass = computed(()=>({
  open_panel:open.value,
  close_panel:!open.value,
}))

const controlSidebar = ()=>{
  open.value = !open.value
}

const openSidebar = ()=>{
  open.value = true
}
</script>

<template>
  <div :class="layoutClass" class="organization-layout">
    <SidebarContent @on-change="controlSidebar" @on-open="openSidebar"/>
    <PageContent @on-open="openSidebar" />
  </div>

<!--  <router-view v-slot="{ Component }">-->
<!--    <transition name="slide-right" mode="out-in">-->
<!--      <component :is="Component" />-->
<!--    </transition>-->
<!--  </router-view>-->
</template>

<style scoped>

</style>