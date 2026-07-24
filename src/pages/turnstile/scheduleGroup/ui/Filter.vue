<script setup>
  import { useComponentStore, useShiftTypeStore } from '@/store/modules/index.js'
  import { UINSelect, UIPageFilter, UISelect } from '@/components/index.js'
  import { ArrowLeft20Filled } from '@vicons/fluent'

  const store = useShiftTypeStore()
  const componentStore = useComponentStore()

  const onSearchEv = () => {
    store.groupParams.page = 1
    store._group()
  }

  const filterEvent = () => {
    store.groupParams.page = 1
    store._group()
  }

  const onChangeStructure = (v) => {
    store.groupParams.organizations = v
    store.departmentGroupList = []
    store.groupParams.departments = []
    filterEvent()
    if (v.length === 0) return
    store._departmentGroup()
  }

  const onDefaultEv = (v) => {
    store.groupParams.organizations = v
    store.departmentGroupList = []
    store.groupParams.departments = []
    if (v.length === 0) return
    store._departmentGroup()
  }

  const beforeShow = () => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }

  const resetFilter = () => {
    store.groupParams.organizations = []
    store.groupParams.departments = []
    store.departmentGroupList = []
    filterEvent()
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.groupParams.search"
    :search-loading="store.groupLoading"
    :show-add-button="false"
    :show-filter-button="!store.groupParams.schedule_type"
    @onSearch="onSearchEv"
    @show="beforeShow"
    @onClear="resetFilter"
  >
    <template #filterAction>
      <n-button v-if="store.groupParams.schedule_type" type="error" @click="store.activeTab = 1">
        <template #icon>
          <ArrowLeft20Filled />
        </template>
        {{ $t('content.back') }}
      </n-button>
    </template>
    <template #filterContent>
      <div class="ui-filter-grid grid grid-cols-12 gap-x-5 gap-y-4">
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('actionLog.table.structure') }}</label>
          <UISelect
            :options="componentStore.structureList"
            :model-v="store.groupParams.organizations"
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
            :loading="store.departmentGroupLoading"
            :options="store.departmentGroupList"
            v-model:value="store.groupParams.departments"
            @update:value="filterEvent"
          />
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>
