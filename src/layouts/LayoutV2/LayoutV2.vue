<script setup>
import SidebarContent from "./ui/SidebarContent.vue";
import PageContent from "./ui/PageContent.vue";


const open = ref(true)

const layoutClass = computed(()=>({
  open_panel:open.value,
  close_panel:!open.value,
}))

const saveAppSidebar = (visible)=>{
  localStorage.setItem('appSidebar', JSON.stringify(visible))
}

const controlSidebar = ()=>{
  saveAppSidebar(!open.value)
  open.value = !open.value

}

const openSidebar = ()=>{
  saveAppSidebar(true)
  open.value = true
}



onMounted(()=>{
  open.value = JSON.parse(localStorage.getItem('appSidebar'))
})
</script>

<template>
  <div :class="layoutClass" class="organization-layout">
    <SidebarContent @on-change="controlSidebar" @on-open="openSidebar"/>
    <PageContent @on-open="openSidebar" />
  </div>
</template>
