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

  const beforeShow = () => {
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
    :filter-count="filterCount"
    @onClear="resetFilter"
  >
    <template #filterContent>
      <div class="ui-filter-grid grid grid-cols-12 gap-x-5 gap-y-4">
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('actionLog.table.structure') }}</label>
          <UISelect
            :options="componentStore.structureList"
            :model-v="store.params.organizations"
            @updateModel="onChangeStructure"
            @defaultValue="onDefaultEv"
            :checked-val="store.structureCheck2"
            @updateCheck="(v) => (store.structureCheck2 = v)"
            :loading="componentStore.structureLoading"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
            @onSubmit="filterEvent"
            :multiple="false"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('content.department') }}</label>
          <UINSelect
            multiple
            clearable
            :loading="store.departmentLoading"
            :options="store.departmentList"
            v-model:value="store.params.departments"
            @update:value="filterEvent"
          />
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>
