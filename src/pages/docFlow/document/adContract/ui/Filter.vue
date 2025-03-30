<script setup>
import {UIPageFilter, UIStructure} from "@/components/index.js"
import { useComponentStore, useAdContractStore} from "@/store/modules/index.js"
import {useAppSetting} from "@/utils/index.js"

const store = useAdContractStore()
const componentStore = useComponentStore()

const onAdd = ()=>{
  store.visibleType = true
  store.resetForm()
  store.visible = true
}

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length))
    + Number(Boolean(store.params.confirmation))
    +Number(Boolean(store.params.created))
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
  store.params.confirmation = null
  store.params.created = null
  filterEvent()
}





const beforeShow = (v)=>{
  if(v && componentStore.confirmationStatusList.length === 0){
    componentStore._enumsAdmin()
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
      @show="beforeShow"
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
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('content.status')}}</label>
      <n-select
          v-model:value="store.params.confirmation"
          :options="componentStore.confirmationStatusList"
          label-field="name"
          value-field="id"
          :placeholder="$t('content.choose')"
          clearable
          @update:value="filterEvent"
          :loading="componentStore.enumAdminLoading"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('content.created')}}</label>
      <n-date-picker
          class="w-full"
          v-model:value="store.params.created"
          type="date"
          :placeholder="$t(`content.choose`)"
          :format="useAppSetting.datePicketFormat"
          @update:value="filterEvent"
      />
    </template>

  </UIPageFilter>
</template>

<style scoped>

</style>