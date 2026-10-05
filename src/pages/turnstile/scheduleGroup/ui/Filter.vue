<script setup>
  import { useAccountStore, useComponentStore, useShiftTypeStore } from '@/store/modules/index.js'
  import { UINSelect, UIPageFilter, UISelect } from '@/components/index.js'

  const store = useShiftTypeStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  // Tuzilma/bo'lim filtri sahifadagi ikkala ro'yxatga ham tegishli: chapdagi smena turlari
  // ham, o'ngdagi guruhlar ham bir xil tashkilot bo'yicha ko'rinsin.
  const syncShiftTypeFilter = () => {
    if (!accStore.canView(accStore.pn.turnstileSheetsWorkersRead)) return
    store.params.organizations = store.groupParams.organizations
    store.params.departments = store.groupParams.departments
    store.params.page = 1
    store._index()
  }

  const onSearchEv = () => {
    store.groupParams.page = 1
    store._group()
  }

  const filterEvent = () => {
    store.groupParams.page = 1
    store._group()
    syncShiftTypeFilter()
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

  const filterCount = computed(
    () =>
      Number(Boolean(store.groupParams.organizations.length)) +
      Number(Boolean(store.groupParams.departments.length))
  )
</script>

<template>
  <UIPageFilter
    v-model:search="store.groupParams.search"
    :show-search-input="!store.groupParams.schedule_type"
    :placeholder="$t('shiftType.form.searchByShiftName')"
    :search-loading="store.groupLoading"
    :show-add-button="false"
    :filter-count="filterCount"
    @onSearch="onSearchEv"
    @show="beforeShow"
    @onClear="resetFilter"
  >
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
