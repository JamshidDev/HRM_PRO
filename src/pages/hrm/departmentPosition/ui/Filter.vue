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
  componentStore._departments()
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

const onShow = () => {
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
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
          @updateModel="onChangeStructure"
          :checkedVal="store.structureCheck"
          @updateCheck="(v)=>store.structureCheck=v"
          :loading="componentStore.structureLoading"
          @onSubmit="filterEvent"
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
          :placeholder="$t('content.choose')"
          clearable
          @update:value="onChangeDepartment"
          :max-tag-count="1"
          :filter="()=>true"
          @search="componentStore._onSearchDepartment"
          @scroll="componentStore._onScrollDepartment"
      />

    </template>

  </UIPageFilter>
</template>

<style scoped>

</style>