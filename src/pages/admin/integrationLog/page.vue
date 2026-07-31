<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { useAccountStore, useIntegrationLogStore } from '@/store/modules/index.js'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import Dashboard from './ui/Dashboard.vue'
  import Clients from './ui/Clients.vue'

  const store = useIntegrationLogStore()
  const accStore = useAccountStore()

  watch(() => store.activeTab, (tab) => {
    if (tab === store.tabs[0] && store.list.length === 0) {
      store._index()
    }
    if (tab === store.tabs[1] && !store.summary) {
      if (!store.dashboardParams.date_from || !store.dashboardParams.date_to) {
        const now = new Date()
        store.dashboardParams.date_from = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
        store.dashboardParams.date_to = now.getTime()
      }
      store._dashboard()
    }
    if (tab === store.tabs[2] && store.users.length === 0) {
      store._users()
    }
  })

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.admin)) return
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    store.dashboardParams.date_from = firstOfMonth.getTime()
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
        <Table />
      </n-tab-pane>
      <n-tab-pane :name="store.tabs[1]" class="!pt-0">
        <Dashboard />
      </n-tab-pane>
      <n-tab-pane :name="store.tabs[2]" class="!pt-0">
        <Clients />
      </n-tab-pane>
    </n-tabs>
  </UIPageContent>
</template>
