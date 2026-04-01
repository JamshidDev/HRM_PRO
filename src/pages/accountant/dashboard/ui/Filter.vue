<script setup>
  import { UIPageFilter, UISelect, UIYearMonth } from '@/components/index.js'
  import {
    useAccDashboardStore,
    useAccountStore,
    useComponentStore
  } from '@/store/modules/index.js'
  import { getOneMonthAgoYearMonth } from '@utils'

  const store = useAccDashboardStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const filterEvent = () => {
    if (!accStore.checkAction(accStore.pn.economistDashboard)) return
    store.params.page = 1
    store._index()
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const filterCount = computed(() => {
    const def = getOneMonthAgoYearMonth()
    return (
      Number(Boolean(store.params.organizations.length)) +
      Number(store.params.year !== def.year || store.params.month !== def.month)
    )
  })

  const resetFilter = () => {
    const def = getOneMonthAgoYearMonth()
    store.params.organizations = []
    store.params.year = def.year
    store.params.month = def.month
    filterEvent()
  }

  const beforeShow = (v) => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }
</script>

<template>
  <UIPageFilter
    @show="beforeShow"
    v-model:search="store.params.search"
    :search-loading="store.loading"
    @onSearch="filterEvent"
    :show-add-button="false"
    :filterCount="filterCount"
    @onClear="resetFilter"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('actionLog.table.structure')
      }}</label>
      <UISelect
        :options="componentStore.structureList"
        :modelV="store.params.organizations"
        @defaultValue="(v) => (store.params.organizations = v)"
        @updateModel="onChangeStructure"
        :checkedVal="store.structureCheck2"
        @updateCheck="(v) => (store.structureCheck2 = v)"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        @onSubmit="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{ $t('content.year') }} / {{ $t('content.month') }}</label>
      <UIYearMonth
        v-model:year="store.params.year"
        v-model:month="store.params.month"
        :clearable="false"
        @change="filterEvent"
      />
    </template>
  </UIPageFilter>
</template>
