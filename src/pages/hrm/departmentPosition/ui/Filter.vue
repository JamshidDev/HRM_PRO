<script setup>
  import {
    useDepartmentPositionStore,
    useComponentStore,
    useAccountStore
  } from '@/store/modules/index.js'
  import { UINSelect, UIPageFilter, UISelect } from '@/components/index.js'
  import { useDebounce, generateUUIDKey } from '@/utils/index.js'
  const accStore = useAccountStore()
  const store = useDepartmentPositionStore()
  const componentStore = useComponentStore()

  const debounceIndexEv = useDebounce(store._index)

  const depParams = computed(() => ({
    ...store.filterDepParams,
    organizations: store.params.organizations.map((v) => v.id).toString(),
    key: undefined
  }))
  const detectKey = (store.filterDepParams.key ||= generateUUIDKey())
  const departmentState = computed(() => componentStore.getDepartmentState(detectKey))
  const fetchDepartment = useDebounce(componentStore.createDepartmentFetcher(detectKey))
  const onSearchDepartment = (v) => {
    store.filterDepParams.page = 1
    store.filterDepParams.search = v
    fetchDepartment(depParams.value)
  }
  const onScrollDepartment = () => {
    store.filterDepParams.page++
    fetchDepartment(depParams.value, true)
  }

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.hrPositionsRead)) return
    store.params.page = 1
    filterEvent()
  }

  const filterEvent = () => {
    store.filterDepParams.page = 1
    store.params.page = 1
    debounceIndexEv()
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    store.params.departments = []
    componentStore.getDepartmentState(detectKey).list = []
    fetchDepartment(depParams.value)
    filterEvent()
  }

  const onDefaultEv = (v) => {
    store.params.organizations = v
    store.params.departments = []
    componentStore.getDepartmentState(detectKey).list = []
    fetchDepartment(depParams.value)
  }

  const filterCount = computed(() => {
    return (
      Number(Boolean(store.params.organizations.length > 0)) +
      Number(Boolean(store.params.departments.length > 0))
    )
  })

  const clearFilter = () => {
    store.params.organizations = []
    store.params.departments = []
    filterEvent()
  }

  const onChangeDepartment = () => {
    filterEvent()
  }

  const onAdd = () => {
    componentStore._structures()
    if (!accStore.checkAction(accStore.pn.hrPositionsWrite)) return
    componentStore._enums()
    componentStore._positions()
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }

  const onShow = () => {
    if (componentStore.structureList.length > 0) return
    componentStore._structures()
  }

  onUnmounted(() => {
    debounceIndexEv?.cancel()
    fetchDepartment?.cancel()
  })
</script>
<template>
  <UIPageFilter
    @show="onShow"
    :search-loading="store.loading"
    :filter-count="filterCount"
    v-model:search="store.params.search"
    @onSearch="onSearch"
    @onClear="clearFilter"
    @onAdd="onAdd"
    :show-add-button="true"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.organization') }}</label>
      <UISelect
        :options="componentStore.structureList"
        :modelV="store.params.organizations"
        @updateModel="onChangeStructure"
        @defaultValue="onDefaultEv"
        :checkedVal="store.structureCheck"
        @updateCheck="(v) => (store.structureCheck = v)"
        :loading="componentStore.structureLoading"
        @onSubmit="filterEvent"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
      />
      <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.department') }}</label>
      <UINSelect
        multiple
        clearable
        :disabled="store.params.organizations.length === 0"
        :loading="departmentState.loading"
        :options="departmentState.list"
        :total-count="departmentState.total"
        v-model:value="store.params.departments"
        @update:value="onChangeDepartment"
        @onSearch="onSearchDepartment"
        @onScrollEv="onScrollDepartment"
      />
    </template>
  </UIPageFilter>
</template>
