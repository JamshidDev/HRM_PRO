<script setup>
  import { UIPageFilter } from '@/components/index.js'
  import { useIntegrationLogStore } from '@/store/modules/index.js'
  import { useDebounceFn } from '@vueuse/core'

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
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :show-add-button="false"
    :filterCount="filterCount"
    :search-loading="store.loading"
    @onClear="onClear"
    @onSearch="filterEvent"
  >
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
  </UIPageFilter>
</template>
