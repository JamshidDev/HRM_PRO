<script setup>
  import { UIPageFilter } from '@/components/index.js'
  import { useIntegrationClientsStore } from '@/store/modules/index.js'
  import { ArrowSync24Filled } from '@vicons/fluent'
  import { useAppSetting } from '@/utils/AppSetting.js'

  const store = useIntegrationClientsStore()

  const methodOptions = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'PATCH', value: 'PATCH' }
  ]

  const filterCount = computed(() => Number(Boolean(store.params.method)))

  const onClear = () => {
    store.params.method = null
    filterEvent()
  }

  const filterEvent = () => {
    store._filterEvent()
  }

  // tabs: [0]=dashboard, [1]=clients, [2]=logs
  const isDashboardTab = computed(() => store.activeTab === store.tabs[0])
  const isLogsTab = computed(() => store.activeTab === store.tabs[2])

  const dashboardFilterEvent = () => {
    if (store.dashboardParams.date_from && store.dashboardParams.date_to) {
      store._dashboard()
    }
  }

  const isDateFromDisabled = (ts) => {
    if (!store.dashboardParams.date_to) return false
    return ts > store.dashboardParams.date_to
  }

  const isDateToDisabled = (ts) => {
    if (!store.dashboardParams.date_from) return false
    return ts < store.dashboardParams.date_from
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :show-add-button="false"
    :show-search-input="isLogsTab"
    :filter-count="filterCount"
    :search-loading="store.loading"
    :show-filter-button="isLogsTab"
    @onClear="onClear"
    @onSearch="filterEvent"
  >
    <template #filterBefore>
      <div class="tab-wrapper">
        <n-tabs
          class="tab-switcher"
          v-model:value="store.activeTab"
          type="segment"
          size="small"
        >
          <n-tab-pane :name="store.tabs[0]" :tab="$t('integrationLog.tabs.dashboard')" />
          <n-tab-pane :name="store.tabs[1]" :tab="$t('integrationLog.tabs.clients')" />
          <n-tab-pane :name="store.tabs[2]" :tab="$t('integrationLog.tabs.list')" />
        </n-tabs>
      </div>
    </template>
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500">{{ $t('integrationLog.filter.method') }}</label>
      <n-select
        v-model:value="store.params.method"
        :options="methodOptions"
        clearable
        @update:value="filterEvent"
      />
    </template>
    <template #filterAction>
      <template v-if="isDashboardTab">
        <n-date-picker
          v-model:value="store.dashboardParams.date_from"
          type="date"
          :format="useAppSetting.datePicketFormat"
          :is-date-disabled="isDateFromDisabled"
          clearable
          update-value-on-close
          class="max-w-[160px]"
          :placeholder="$t('integrationLog.filter.dateFrom')"
          @update:value="dashboardFilterEvent"
        />
        <n-date-picker
          v-model:value="store.dashboardParams.date_to"
          type="date"
          :format="useAppSetting.datePicketFormat"
          :is-date-disabled="isDateToDisabled"
          clearable
          update-value-on-close
          class="max-w-[160px]"
          :placeholder="$t('integrationLog.filter.dateTo')"
          @update:value="dashboardFilterEvent"
        />
        <n-button
          :loading="store.dashboardLoading"
          @click="store._dashboard()"
          type="primary"
          ghost
        >
          <template #icon><ArrowSync24Filled /></template>
          {{ $t('content.refresh') }}
        </n-button>
      </template>
    </template>
  </UIPageFilter>
</template>

<style scoped>
.tab-wrapper {
  border: 1px solid var(--border-color, #e0e0e6);
  border-radius: 6px;
  padding: 1px;
  height: 34px;
  display: flex;
  align-items: center;
}

.tab-switcher {
  width: 290px;
  height: 100%;
}

.tab-switcher :deep(.n-tabs-pane-wrapper) {
  display: none;
}

.tab-switcher :deep(.n-tabs-nav) {
  height: 100%;
}

.tab-switcher :deep(.n-tabs-rail) {
  height: 100%;
}

.tab-switcher :deep(.n-tabs-tab) {
  height: 28px;
  padding: 0 12px;
  line-height: 28px;
}
</style>
