<script setup>
import {useAccountStore, useComponentStore, useEduPlanStore} from "@/store/modules/index.js"
import {UIPageFilter, UISelect} from "@/components/index.js"
const store = useEduPlanStore()
const accStore = useAccountStore()
const componentStore = useComponentStore()

const filterEvent = ()=>{
  store.params.page = 1
  store._index()
}



const onChangeStructure = (v)=>{
  store.params.organizations=v
  filterEvent()
}




const resetFilter = ()=>{
  store.params.organizations = []
  store.params.name = null
  store.params.learning_center_id = null
  filterEvent()
}

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length))
    + Number(Boolean(store.params.name))
    + Number(Boolean(store.params.learning_center_id)))

const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

let timer = null
const onKeyUp = ()=>{
  clearTimeout(timer)
  timer = setTimeout(()=>{
    filterEvent()
  }, 1000)
}

onMounted(()=>{
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
})
const onShow = (v)=>{
  if(v && componentStore.lmsLearningCenters.length === 0){
    componentStore._lmsLearningCenter()
  }
}
</script>

<template>
  <UIPageFilter
      v-model:search="store.params.search"
      :search-loading="store.loading"
      @onSearch="filterEvent"
      :filter-count="filterCount"
      @onClear="resetFilter"
      @onAdd="onAdd"
      @show="onShow"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('actionLog.table.structure')}}</label>
      <UISelect
          :options="componentStore.structureList"
          :modelV="store.params.organizations"
          @defaultValue="(v)=>store.params.organizations=v"
          @updateModel="onChangeStructure"
          :checkedVal="store.structureCheck2"
          @updateCheck="(v)=>store.structureCheck2=v"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          @onSubmit="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('content.name')}}</label>
      <n-input
          type="text"
          v-model:value="store.params.name"
          @keyup="onKeyUp"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('eduPlanPage.form.learning_center')}}</label>
      <n-select
          clearable
          filterable
          v-model:value="store.params.learning_center_id"
          :options="componentStore.lmsLearningCenters"
          :loading="componentStore.lmsLearningCenterLoading"
          label-field="name"
          value-field="id"
          @update:value="filterEvent"
      />

    </template>
  </UIPageFilter>
</template>