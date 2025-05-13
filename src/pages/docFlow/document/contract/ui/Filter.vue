<script setup>
import {UIPageFilter, UISelect} from "@/components/index.js"
import {useContractStore, useComponentStore, useAccountStore} from "@/store/modules/index.js"
import {useAppSetting} from "@/utils/index.js"
const accStore = useAccountStore()
const store = useContractStore()
const componentStore = useComponentStore()

const onAdd = ()=>{
  if(accStore.checkAction(accStore.pn.hrContractsWrite)) return

  store.visibleType = true
  store.resetForm()
  store.stepNumber = 1
  store.activeTab = 1
  store.visible = true
  componentStore.worker = null
  componentStore.selectedWorker = null
  componentStore.isSelectedWorker = false
}

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length))
    + Number(Boolean(store.params.status)) + Number(Boolean(store.params.confirmation))
    +Number(Boolean(store.params.created))
)


const onSearchEv = ()=>{
  if(accStore.checkAction(accStore.pn.hrContractsRead)) return

  store.params.page = 1
  store._index()
}

const filterEvent = ()=>{
  store.params.page=1
  store._index()
}

const resetFilter = ()=>{
  store.params.organizations = []
  store.params.status = null
  store.params.confirmation = null
  store.params.created = null
  filterEvent()
}





const beforeShow = (v)=>{
  if(v && componentStore.confirmationStatusList.length === 0){
    componentStore._enumsAdmin()
  }
  if(componentStore.structureList.length === 0){
    componentStore._structures()
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
    <UISelect
        :options="componentStore.structureList"
        :modelV="store.params.organizations"
        @updateModel="(v)=>store.params.organizations=v"
        :checkedVal="store.structureCheck2"
        @updateCheck="(v)=>store.structureCheck2=v"
        :loading="componentStore.structureLoading"
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
    <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('content.status')}}</label>
    <n-select
        v-model:value="store.params.status"
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
        class="w-full mb-2"
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