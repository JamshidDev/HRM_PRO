<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { useAccountStore, useIntegrationClientsStore } from '@/store/modules/index.js'
  import Dashboard from './ui/Dashboard.vue'
  import Filter from './ui/Filter.vue'
  import Clients from './ui/Clients.vue'
  import Table from './ui/Table.vue'

  const store = useIntegrationClientsStore()
  const accStore = useAccountStore()

  // tabs: [0]=dashboard, [1]=clients, [2]=logs
  watch(() => store.activeTab, (tab) => {
    if (tab === store.tabs[1] && store.clients.length === 0) {
      store._clients()
    }
    if (tab === store.tabs[2] && store.list.length === 0) {
      store._index()
    }
  })

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.admin)) return
    const now = new Date()
    store.dashboardParams.date_from = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    store.dashboardParams.date_to = now.getTime()
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
        <Dashboard />
      </n-tab-pane>
      <n-tab-pane :name="store.tabs[1]" class="!pt-0">
        <Clients />
      </n-tab-pane>
      <n-tab-pane :name="store.tabs[2]" class="!pt-0">
        <Table />
      </n-tab-pane>
    </n-tabs>
  </UIPageContent>
</template>
