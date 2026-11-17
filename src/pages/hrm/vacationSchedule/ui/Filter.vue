<script setup>
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useVacationScheduleStore
  } from '@/store/modules/index.js'
  import { People32Filled } from '@vicons/fluent'

  const store = useVacationScheduleStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrVacationScheduleWrite)) return
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  // Filtr o'zgarsa 1-sahifaga qaytiladi (aks holda 3-sahifada bo'sh ro'yxat chiqishi mumkin).
  const filterEvent = () => {
    store.params.page = 1
    store._index()
  }

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.hrVacationScheduleRead)) return
    store.params.page = 1
    store._index()
  }

  // Panelda faqat tashkilot bor.
  const filterCount = computed(() => Number(store.params.organizations.length > 0))

  const beforeShow = (v) => {
    if (v && componentStore.confirmationStatusList.length === 0) {
      componentStore._enumsAdmin()
    }
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }

  const resetFilter = () => {
    store.params.organizations = []
    store.structureCheck2 = []
    filterEvent()
  }
</script>

<template>
  <UIPageFilter
    :add-permission="accStore.pn.hrVacationScheduleWrite"
    v-model:search="store.params.search"
    :search-loading="store.loading"
    :filter-count="filterCount"
    @onAdd="onAdd"
    @onSearch="onSearch"
    @show="beforeShow"
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
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        :loading="componentStore.structureLoading"
        @onSubmit="filterEvent"
      />
    </template>
  </UIPageFilter>
</template>
