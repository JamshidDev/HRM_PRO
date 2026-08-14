<script setup>
  import SidebarContent from './ui/SidebarContent.vue'
  import PageContent from './ui/PageContent.vue'
  import HelperLayout from './ui/HelperLayout.vue'
  import ReactionScreen from '@/pages/app/home/ui/ReactionScreen.vue'
  import OldVersionButton from '@/components/buttons/OldVersionButton.vue'
  import AIFloatingButton from '@/components/buttons/AIFloatingButton.vue'
  import { useAccountStore } from '@/store/modules/index.js'
  const store = useAccountStore()

  const open = ref(false)

  const layoutClass = computed(() => ({
    open_panel: open.value,
    close_panel: !open.value
  }))

  const saveAppSidebar = (visible) => {
    localStorage.setItem('appSidebar', JSON.stringify(visible))
  }

  const controlSidebar = () => {
    saveAppSidebar(!open.value)
    open.value = !open.value
  }

  const openSidebar = () => {
    saveAppSidebar(true)
    open.value = true
  }

  /**
   * `persist=false` — mobilda navigatsiyadan keyingi yopilish; desktop uchun
   * saqlangan sidebar holatini o'zgartirmaydi.
   */
  const closeSidebar = (persist = true) => {
    if (persist) saveAppSidebar(false)
    open.value = false
  }

  onBeforeMount(() => {
    open.value = JSON.parse(localStorage.getItem('appSidebar'))
  })
</script>

<template>
  <div :class="layoutClass" class="organization-layout">
    <OldVersionButton :is-sidebar-open="open" />
    <SidebarContent @on-change="controlSidebar" @on-open="openSidebar" @on-close="closeSidebar" />
    <PageContent @on-open="openSidebar" />
    <HelperLayout />
    <ReactionScreen />
    <AIFloatingButton v-if="store.checkPermission(store.pn.ai)" />
  </div>
</template>
