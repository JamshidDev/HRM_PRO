<script setup>
  import { UIPageFilter } from '@/components/index.js'
  import { useIntegrationLogStore } from '@/store/modules/index.js'
  import { useDebounceFn } from '@vueuse/core'
  import { ArrowSync24Filled } from '@vicons/fluent'

  const store = useIntegrationLogStore()

  const methodOptions = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'PATCH', value: 'PATCH' }
  ]

  const apiTypeOptions = [
    { label: 'Sanctum', value: 'sanctum' },
    { label: 'Bearer', value: 'bearer' }
  ]

  const filterCount = computed(() => {
    return (
      Number(Boolean(store.params.api_type)) +
      Number(Boolean(store.params.method))
    )
  })

  const onClear = () => {
    store.params.api_type = null
    store.params.method = null
    filterEvent()
  }

  const onSearchEv = useDebounceFn(() => {
    filterEvent()
  }, 300)

  const filterEvent = () => {
    store._filterEvent()
  }

  const isListTab = computed(() => store.activeTab === store.tabs[0])
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :show-add-button="false"
    :show-search-input="isListTab"
    :filter-count="filterCount"
    :search-loading="store.loading"
    :show-filter-button="isListTab"
    @onClear="onClear"
    @onSearch="filterEvent"
  >
    <template #filterBefore>
      <n-tabs
        class="tab-switcher"
        style="width: 200px"
        v-model:value="store.activeTab"
        type="segment"
        size="small"
      >
        <n-tab-pane :name="store.tabs[1]" :tab="$t('integrationLog.tabs.dashboard')" />
        <n-tab-pane :name="store.tabs[0]" :tab="$t('integrationLog.tabs.list')" />
      </n-tabs>
    </template>
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500">{{ $t('integrationLog.filter.apiType') }}</label>
      <n-select
        v-model:value="store.params.api_type"
        :options="apiTypeOptions"
        clearable
        @update:value="filterEvent"
      />

      <label class="mt-3 text-xs text-gray-500">{{ $t('integrationLog.filter.method') }}</label>
      <n-select
        v-model:value="store.params.method"
        :options="methodOptions"
        clearable
        @update:value="filterEvent"
      />
    </template>
    <template #filterAction>
      <n-button
        v-if="!isListTab"
        :loading="store.dashboardLoading"
        @click="store._dashboard()"
        type="primary"
        ghost
      >
        <template #icon><ArrowSync24Filled /></template>
        {{ $t('content.refresh') }}
      </n-button>
    </template>
  </UIPageFilter>
</template>

<style scoped>
.tab-switcher :deep(.n-tabs-pane-wrapper) {
  display: none;
}
</style>
