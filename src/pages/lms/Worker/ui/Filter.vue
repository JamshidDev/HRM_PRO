<script setup>
import {useAccountStore, useComponentStore, useLmsWorkerStore} from "@/store/modules/index.js"
import {UIPageFilter, UISelect} from "@/components/index.js"
import UIHelper from "@/utils/UIHelper.js"
const store = useLmsWorkerStore()
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
  store.params.edu_plan_id = null
  filterEvent()
}

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length)) + Number(Boolean(store.params.edu_plan_id)))

const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

onMounted(()=>{


})
const onShow = (v)=>{
  if(v && store.eduPlanList.length === 0){
    store._eduPlans()
  }

  if(componentStore.structureList.length === 0){
    componentStore._structures()
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
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('lmsWorkerPage.form.eduPlan')}}</label>
      <n-select
          clearable
          filterable
          v-model:value="store.params.edu_plan_id"
          :options="store.eduPlanList"
          :loading="store.eduPlanLoading"
          label-field="name"
          value-field="id"
          @update:value="filterEvent"
          :render-label="UIHelper.selectRender.label"
          :render-tag="UIHelper.selectRender.value"
      />

    </template>
  </UIPageFilter>
</template>