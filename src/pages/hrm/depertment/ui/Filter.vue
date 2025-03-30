<script setup>
import {UIPageFilter, UIStructure} from "@/components/index.js"
import { useDepartmentStore} from "@/store/modules/index.js"

const store = useDepartmentStore()

const onAdd = ()=>{
  store.visibleType = true
  store.resetForm()
  store.visible = true
}

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length))
    + Number(Boolean(store.params.level))
)


const onSearchEv = ()=>{
  store.params.page = 1
  store._index()
}

const filterEvent = ()=>{
  store._index()
}

const resetFilter = ()=>{
  store.params.organizations = []
  store.params.level = null
  filterEvent()
}

const onLevel = ()=>{
  if(store.levelList.length === 0){
    store._level()
  }

}

</script>

<template>
  <UIPageFilter
      @onAdd="onAdd"
      @onSearch="onSearchEv"
      v-model:search="store.params.search"
      :searchLoading="store.loading"
      :filter-count="filterCount"
      @onClear="resetFilter"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('actionLog.table.structure')}}</label>
      <UIStructure
          :modelV="store.params.organizations"
          @updateModel="(v)=>store.params.organizations=v"
          :checkedVal="store.structureCheck2"
          @updateCheck="(v)=>store.structureCheck2=v"
          @onSubmit="filterEvent"
      />

      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('departmentPage.form.level')}}</label>
      <n-select
          v-model:value="store.params.level"
          :options="store.levelList"
          label-field="name"
          value-field="id"
          :placeholder="$t('content.choose')"
          clearable
          @update:value="filterEvent"
          :loading="store.levelLoading"
          @focus="onLevel"
      />

    </template>

  </UIPageFilter>
</template>

<style scoped>

</style>