<script setup>
  import { UIPageFilter, UISelect } from '@components'
  import {
    useComponentStore,
    useWorkerProfileStore
  } from '@stores'

  const store = useWorkerProfileStore()
  const componentStore = useComponentStore()

  const onSearch = () => {
    store.userRoleParams.page = 1
    store._userRole()
  }

  const filterEvent = () => {
    store._userRole()
  }

  const filterCount = computed(() => {
    let count = 0
    if (store.userRoleParams.organizations.length) count++
    if (store.userRoleParams.role) count++
    return count
  })

  const beforeShow = (v) => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
    if (componentStore.roles.length === 0) {
      componentStore._enums()
    }
  }

  const onChangeStructure = (v) => {
    store.userRoleParams.organizations = v
    filterEvent()
  }

  const onChangeRole = (v) => {
    store.userRoleParams.role = v
    store.userRoleParams.page = 1
    filterEvent()
  }

  const resetFilter = () => {
    store.userRoleParams.organizations = []
    store.userRoleParams.role = null
    filterEvent()
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.userRoleParams.search"
    @onSearch="onSearch"
    @show="beforeShow"
    @onClear="resetFilter"
    :filter-count="filterCount"
    :search-loading="store.loading"
    :show-add-button="false"
  >
    <template #filterContent>
      <label class="text-xs text-gray-500 mb-1 font-medium">{{
        $t('content.role')
      }}</label>
      <n-select
        v-model:value="store.userRoleParams.role"
        filterable
        clearable
        @update:value="onChangeRole"
        :options="componentStore.roles"
        :loading="componentStore.enumLoading"
        label-field="name"
        value-field="id"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('actionLog.table.structure')
      }}</label>
      <UISelect
        :options="componentStore.structureList"
        :modelV="store.userRoleParams.organizations"
        @defaultValue="(v) => (store.userRoleParams.organizations = v)"
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
