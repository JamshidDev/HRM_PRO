<script setup>
import {useDepartmentPositionStore, useComponentStore} from "@/store/modules/index.js"
import {UIPageFilter, UIStructure} from "@/components/index.js"
import {HomePerson20Regular} from "@vicons/fluent"

const store = useDepartmentPositionStore()
const componentStore = useComponentStore()

const onAdd = () => {
  componentStore.checkUserVisible = true
}

const onSearch = () => {
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

const marks = {
  1: "1",
  25: "25",
  50: "50",
  75: "75",
  100: "100"
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
</script>

<template>
  <UIPageFilter

      :search-loading="store.loading"
      :filter-count="filterCount"
      v-model:search="store.params.search"
      @onSearch="onSearch"
      @onClear="clearFilter"
      :show-add-button="false"
  >
    <template #filterAction>
      <n-button
          type="primary"
          icon-placement="right"
          @click="onAdd"
      >
        <template #icon>
          <n-icon>
            <HomePerson20Regular/>
          </n-icon>
        </template>
        {{ $t('workerPage.filter.contract') }}
      </n-button>
    </template>

    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500">{{ $t('workerPage.filter.organization') }}</label>
      <UIStructure
          :modelV="store.params.organizations"
          @updateModel="onChangeStructure"
          :checkedVal="store.structureCheck"
          @updateCheck="(v)=>store.structureCheck=v"
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