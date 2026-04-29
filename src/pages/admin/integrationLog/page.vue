<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { useAccountStore, useIntegrationLogStore } from '@/store/modules/index.js'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import Dashboard from './ui/Dashboard.vue'

  const store = useIntegrationLogStore()
  const accStore = useAccountStore()

  watch(() => store.activeTab, (tab) => {
    if (tab === store.tabs[0] && store.list.length === 0) {
      store._index()
    }
    if (tab === store.tabs[1] && !store.summary) {
      store._dashboard()
    }
  })

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.admin)) return
    store._dashboard()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <n-tabs
      v-model:value="store.activeTab"
      type="segment"
      class="hidden-tab-header"
      animated
    >
      <n-tab-pane :name="store.tabs[0]" class="!pt-0">
        <Table />
      </n-tab-pane>
      <n-tab-pane :name="store.tabs[1]" class="!pt-0">
        <Dashboard />
      </n-tab-pane>
    </n-tabs>
  </UIPageContent>
</template>
