<script setup>
import {useDepartmentPositionStore, useComponentStore, useAccountStore} from "@/store/modules/index.js"
import {UIPageFilter, UISelect} from "@/components/index.js"
import {HomePerson20Regular} from "@vicons/fluent"
const accStore = useAccountStore()
const store = useDepartmentPositionStore()
const componentStore = useComponentStore()


const onSearch = () => {
  if(!accStore.checkAction(accStore.pn.hrPositionsRead)) return

  store.params.page = 1
  store._index()
}

const filterEvent = () => {
  componentStore.depParams.page = 1
  store.params.page = 1
  store._index()
}

const onChangeStructure = (v) => {
  store.params.organizations = v
  componentStore.depParams.organizations = v.map((x) => x.id)
  componentStore.departmentList = []
  filterEvent()
}


const filterCount = computed(()=>{
  return Number(Boolean(store.params.organizations.length>0))
      + Number(Boolean(store.params.departments.length>0))
})

const clearFilter = ()=>{
  store.params.organizations = []
  store.params.departments = []
  filterEvent()
}

const onChangeDepartment = ()=>{
  filterEvent()
}

const onAdd = ()=>{
  componentStore._structures()
  if(!accStore.checkAction(accStore.pn.hrPositionsWrite)) return
  componentStore._enums()
  componentStore._positions()
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onShow = (v) => {
  if(!v) return
  componentStore._structures()
}

const onUpdateShow = (v)=>{
  if(!v || componentStore.departmentList.length>0) return
  componentStore.onOpenDepartmentEv(v)
}


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
          @defaultValue="(v)=>store.params.organizations=v"
          @updateModel="onChangeStructure"
          :checkedVal="store.structureCheck"
          @updateCheck="(v)=>store.structureCheck=v"
          :loading="componentStore.structureLoading"
          @onSubmit="filterEvent"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
      />

      <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.department') }}</label>
      <n-select
          :disabled="store.params.organizations.length === 0"
          v-model:value="store.params.departments"
          :options="componentStore.departmentList"
          multiple
          filterable
          label-field="name"
          value-field="id"
          clearable
          @update:value="onChangeDepartment"
          :max-tag-count="1"
          :filter="()=>true"
          @search="componentStore._onSearchDepartment"
          @scroll="componentStore._onScrollDepartment"
          @update:show="onUpdateShow"
          :loading="componentStore.departmentLoading"
      />

    </template>

  </UIPageFilter>
</template>

<style scoped>

</style>