<script setup>
  import { useShiftTypeStore } from '@/store/modules/index.js'
  import { UIPageFilter } from '@/components/index.js'
  import { ArrowLeft20Filled } from '@vicons/fluent'

  const store = useShiftTypeStore()

  const onSearchEv = () => {
    store.groupWorkerParams.page = 1
    store._groupWorkers()
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.groupWorkerParams.search"
    :search-loading="store.groupWorkerLoading"
    :show-filter-button="false"
    :show-add-button="false"
    @onSearch="onSearchEv"
  >
    <template #filterAction>
      <n-button type="error" @click="store.activeTab = 2">
        <template #icon>
          <ArrowLeft20Filled />
        </template>
        {{ $t('content.back') }}
      </n-button>
    </template>
  </UIPageFilter>
</template>
