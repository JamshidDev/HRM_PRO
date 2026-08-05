<script setup>
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import { getTableConfig } from './tableConfig.js'
  import Table from './Table.vue'
  import PreviewFilter from './PreviewFilter.vue'

  const dashboardStore = useTurnstileDashboardStore()

  const changePage = (v) => {
    dashboardStore.previewParams.page = v.page
    dashboardStore.previewParams.per_page = v.per_page
    dashboardStore._preview(true)
  }

  const tableConfig = computed(() => {
    return getTableConfig(dashboardStore.previewParams.type)
  })

  const handleRowClick = () => {}
</script>

<template>
  <div class="h-[calc(100vh-100px)] flex flex-col gap-4">
    <PreviewFilter />
    <Table
      :data="dashboardStore.previewList"
      :columns="tableConfig.columns"
      :loading="dashboardStore.previewLoading"
      :page="dashboardStore.previewParams.page"
      :per-page="dashboardStore.previewParams.per_page"
      :total="dashboardStore.previewTotal"
      @row-click="handleRowClick"
      @change-page="changePage"
    />
  </div>
</template>
