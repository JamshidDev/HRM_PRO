<script setup>
  import { NoDataPicture, UIPagination } from '@/components/index.js'
  import { useEventStore, useTurnstileDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { getTableConfig } from './tableConfig.js'
  import Table from './Table.vue'
  import PreviewFilter from './PreviewFilter.vue'

  const { t } = i18n.global
  const dashboardStore = useTurnstileDashboardStore()

  const changePage = (v) => {
    dashboardStore.previewParams.page = v.page
    dashboardStore.previewParams.per_page = v.per_page
    dashboardStore._preview(true)
  }

  const tableConfig = computed(() => {
    return getTableConfig(dashboardStore.previewParams.type)
  })

  const handleRowClick = (item, index) => {}
</script>

<template>
  <div class="h-[calc(100vh-100px)] overflow-y-auto">
    <PreviewFilter />
    <n-spin :show="dashboardStore.previewLoading" style="min-height: 200px">
      <Table
        v-if="dashboardStore.previewList.length > 0"
        :data="dashboardStore.previewList"
        :columns="tableConfig.columns"
        :loading="dashboardStore.previewLoading"
        :show-index="true"
        :index-label="$t('content.number')"
        :page="dashboardStore.previewParams.page"
        :per-page="dashboardStore.previewParams.per_page"
        @row-click="handleRowClick"
      />

      <UIPagination
        v-if="dashboardStore.previewList.length > 0"
        :page="dashboardStore.previewParams.page"
        :per_page="dashboardStore.previewParams.per_page"
        :total="dashboardStore.previewTotal"
        @change-page="changePage"
      />

      <NoDataPicture
        v-if="dashboardStore.previewList.length === 0 && !dashboardStore.previewLoading"
      />
    </n-spin>
  </div>
</template>
