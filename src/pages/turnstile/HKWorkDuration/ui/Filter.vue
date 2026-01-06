<script setup>
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useHKWorkDurationStore
  } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'

  const store = useHKWorkDurationStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const filterEvent = () => {
    if (!accStore.checkAction(accStore.pn.turnstileHcpDurationRead)) return
    store.params.page = 1
    store._index()
  }

  const onSearch = () => {
    store.params.page = 1
    filterEvent()
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const beforeShow = (v) => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
    if (store.levelList.length === 0) {
      store._levels()
    }
  }

  const resetFilter = () => {
    store.params.organizations = []
    store.params.access_levels = []
    filterEvent()
  }

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.organizations.length)) +
      Boolean(store.params.access_levels.length)
  )
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    @onSearch="onSearch"
    :search-loading="store.loading"
    @show="beforeShow"
    :filter-count="filterCount"
    @onClear="resetFilter"
    :show-add-button="false"
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
        :checkedVal="store.structureCheck"
        @updateCheck="(v) => (store.structureCheck = v)"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        @onSubmit="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('turnstile.hcWorkersPage.access_levels')
      }}</label>
      <n-select
        filterable
        multiple
        v-model:value="store.params.access_levels"
        :options="store.levelList"
        :loading="store.levelLoading"
        :max-tag-count="1"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
      />
    </template>
    <template #filterAction>
      <n-date-picker
        class="w-[160px]"
        v-model:value="store.params.date"
        @update:value="filterEvent"
        type="date"
        :format="useAppSetting.datePicketFormat"
      />
    </template>
  </UIPageFilter>
</template>
