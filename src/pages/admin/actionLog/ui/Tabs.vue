<script setup>
  import Table from './Table.vue'
  import AuthTable from './AuthTable.vue'
  import { useActionLogStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  const accStore = useAccountStore()

  const store = useActionLogStore()

  const changeTab = () => {
    if (!accStore.checkAction(accStore.pn.activityLogsRead)) return
    store._filterEvent()
  }
</script>

<template>
  <n-tabs
    animated
    v-model:value="store.activeTab"
    @update:value="changeTab"
    class="hidden-tab-header1 flex-1 overflow-auto"
    pane-wrapper-class="flex-1 flex flex-col"
    type="card"
  >
    <n-tab-pane :name="1" :tab="$t('actionLog.tab.action')" class="flex-1 overflow-auto">
      <Table />
    </n-tab-pane>
    <n-tab-pane :name="2" :tab="$t('actionLog.tab.auth')" class="flex-1 overflow-auto">
      <AuthTable />
    </n-tab-pane>
  </n-tabs>
</template>

<style scoped></style>
