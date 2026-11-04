<script setup>
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import { useAccountStore, useComponentStore, useTimesheetStore } from '@/store/modules/index.js'

  const store = useTimesheetStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrTableWrite)) return
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.hrTableRead)) return
    store.params.page = 1
    store._index()
  }

  const filterEvent = () => {
    store._index()
  }

  const filterCount = computed(
    () => Number(Boolean(store.params.organizations.length)) + Number(Boolean(store.params.period))
  )

  const beforeShow = (v) => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const resetFilter = () => {
    store.params.organizations = []
    store.params.period = null
    filterEvent()
  }
</script>

<template>
  <UIPageFilter
    :add-permission="accStore.pn.hrTableWrite"
    v-model:search="store.params.search"
    @onSearch="onSearch"
    @onAdd="onAdd"
    @show="beforeShow"
    @onClear="resetFilter"
    :filter-count="filterCount"
    :search-loading="store.loading"
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
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{ $t('content.month') }}</label>
      <n-date-picker
        v-model:value="store.params.period"
        type="month"
        clearable
        class="w-full"
        @update:value="onSearch"
      />
    </template>
  </UIPageFilter>
</template>
