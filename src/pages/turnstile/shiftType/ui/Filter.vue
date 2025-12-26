<script setup>
  import { useComponentStore, useShiftTypeStore } from '@/store/modules/index.js'
  import { UINSelect, UIPageFilter, UISelect } from '@/components/index.js'

  const store = useShiftTypeStore()
  const componentStore = useComponentStore()

  const filterEvent = () => {
    store.params.page = 1
    store._index()
  }

  const onSearchEv = () => {
    store.params.page = 1
    store._index()
  }

  const beforeShow = (v) => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    store.departmentList = []
    store.params.departments = []
    filterEvent()
    if (v.length === 0) return
    store._departments()
  }

  const onDefaultEv = (v) => {
    store.params.organizations = v
    store.departmentList = []
    store.params.departments = []
    if (v.length === 0) return
    store._departments()
  }

  const resetFilter = () => {
    store.params.organizations = []
    store.params.departments = []
    store.departmentList = []
    filterEvent()
  }
  const filterCount = computed(
    () =>
      Number(Boolean(store.params.organizations.length)) +
      Number(Boolean(store.params.departments.length))
  )
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    :show-add-button="false"
    @onSearch="onSearchEv"
    @show="beforeShow"
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
        @updateModel="onChangeStructure"
        @defaultValue="onDefaultEv"
        :checkedVal="store.structureCheck2"
        @updateCheck="(v) => (store.structureCheck2 = v)"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        @onSubmit="filterEvent"
        :multiple="false"
      />
      <label class="mt-3 text-xs mb-1 font-medium">{{ $t('content.department') }}</label>
      <UINSelect
        multiple
        clearable
        :loading="store.departmentLoading"
        :options="store.departmentList"
        v-model:value="store.params.departments"
        @update:value="filterEvent"
      />
    </template>
  </UIPageFilter>
</template>
