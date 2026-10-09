<script setup>
  import { UIDrawer, UIPageContent, UIPageFilter } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import OrgPanel from './ui/OrgPanel.vue'
  import {
    useOrganizationStore,
    useComponentStore,
    useAccountStore
  } from '@/store/modules/index.js'
  import { useAppBreakpoints } from '@/composables/useBreakpoint.js'
  import { useElementSize } from '@vueuse/core'

  const store = useOrganizationStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()
  // Keng ekranda panel daraxt yonida turadi, torida — drawer ichida.
  const { isCompact } = useAppBreakpoints()

  // Panel ekranning o'rtasigacha: maydonning yarmi (12px — daraxt bilan oradagi joy).
  // Kenglik px da beriladi — `0 → px` animatsiyasi va ichki qatlam uchun bir xil qiymat.
  const splitRef = ref(null)
  const { width: splitWidth } = useElementSize(splitRef)
  const panelWidth = computed(() => Math.max(380, Math.round((splitWidth.value - 12) / 2)))

  const onSearch = () => {
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.organizationsWrite)) return
    componentStore._organizationLevel()
    componentStore._organizations()
    store.startCreate()
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.organizationsRead)) return
    store._index()
  })

  onBeforeUnmount(() => {
    store.closePanel()
  })
</script>

<template>
  <UIPageContent>
    <UIPageFilter
      :add-permission="accStore.pn.organizationsWrite"
      :show-filter-button="false"
      v-model:search="store.params.search"
      @on-search="onSearch"
      @on-add="onAdd"
    />
    <div ref="splitRef" class="flex-1 min-h-0 flex">
      <Table class="min-w-0" />
      <!-- Tashqi qatlam kengligi 0 dan ochiladi (daraxt silliq torayadi), ichkisi
           o'z kengligida o'ngdan suriladi — kontent siqilib qolmaydi. -->
      <Transition name="panel-slide">
        <div
          v-if="store.panel.open && !isCompact"
          class="panel-shell ml-3 shrink-0 min-h-0 overflow-hidden"
          :style="{ width: `${panelWidth}px` }"
        >
          <div class="panel-inner h-full" :style="{ width: `${panelWidth}px` }">
            <OrgPanel />
          </div>
        </div>
      </Transition>
    </div>
    <UIDrawer
      v-if="isCompact"
      :visible="store.panel.open"
      @update:visible="(v) => !v && store.closePanel()"
      hide-header
      disable-body-padding
    >
      <template #content>
        <OrgPanel class="h-[100dvh] rounded-none! border-0!" />
      </template>
    </UIDrawer>
  </UIPageContent>
</template>

<style scoped>
  /* Ochilish: avval joy ochiladi, keyin panel o'ngdan kirib keladi.
     Yopilish biroz tezroq — panel avval chiqadi, keyin joy yopiladi. */
  .panel-slide-enter-active,
  .panel-slide-enter-active .panel-inner {
    transition:
      width 0.42s cubic-bezier(0.22, 1, 0.36, 1),
      margin-left 0.42s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.36s ease 0.08s,
      transform 0.42s cubic-bezier(0.22, 1, 0.36, 1) 0.06s;
  }

  .panel-slide-leave-active,
  .panel-slide-leave-active .panel-inner {
    transition:
      width 0.32s cubic-bezier(0.4, 0, 0.2, 1) 0.06s,
      margin-left 0.32s cubic-bezier(0.4, 0, 0.2, 1) 0.06s,
      opacity 0.2s ease,
      transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* `!important` — kenglik inline style'da (px), aks holda klass uni bosa olmaydi */
  .panel-slide-enter-from,
  .panel-slide-leave-to {
    width: 0 !important;
    margin-left: 0 !important;
  }

  .panel-slide-enter-from .panel-inner,
  .panel-slide-leave-to .panel-inner {
    opacity: 0;
    transform: translateX(32px);
  }
</style>
