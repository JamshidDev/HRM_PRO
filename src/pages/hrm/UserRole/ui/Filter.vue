<script setup>
import {UIPageFilter, UISelect} from "@/components/index.js"
import {useAccountStore, useComponentStore, useWorkerProfileStore} from "@/store/modules/index.js"

const store = useWorkerProfileStore()
const accStore = useAccountStore()
const componentStore = useComponentStore()

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrUsersRead)) return
  store.userRoleParams.page = 1
  store._userRole()
}


const filterEvent = ()=>{
  store._userRole()
}

const filterCount = computed(()=>Number(Boolean(store.userRoleParams.organizations.length))
)

const beforeShow = (v)=>{
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
}

const onChangeStructure = (v)=>{
  store.userRoleParams.organizations=v
  filterEvent()
}

const resetFilter = ()=>{
  store.params.organizations = []
  filterEvent()
}

</script>

<template>
  <UIPageFilter
      v-model:search="store.params.search"
      @onSearch="onSearch"
      @show="beforeShow"
      @onClear="resetFilter"
      :filter-count="filterCount"
      :search-loading="store.loading"
      :show-add-button="false"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('actionLog.table.structure')}}</label>
      <UISelect
          :options="componentStore.structureList"

          :modelV="store.userRoleParams.organizations"
          @defaultValue="(v)=>store.userRoleParams.organizations=v"
          @updateModel="onChangeStructure"
          :checkedVal="store.structureCheck2"
          @updateCheck="(v)=>store.structureCheck2=v"
          :loading="componentStore.structureLoading"
          @onSubmit="filterEvent"
      />
    </template>
  </UIPageFilter>
</template>
