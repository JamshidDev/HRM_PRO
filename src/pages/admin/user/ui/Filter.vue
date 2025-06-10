<script setup>
import {UIPageFilter, UISelect} from "@/components/index.js"
import {useComponentStore, useUserStore} from "@/store/modules/index.js"


const store = useUserStore()
const componentStore = useComponentStore()


const filterEvent = ()=>{
  store.params.page = 1
  store._index()

}

const onChangeStructure = (v)=>{
  store.params.organizations = v
  filterEvent()
}

const onShow = (v) => {
  if(!v) return
  componentStore._structures()
  if(store.roleList.length>0) return
  store._roles()
}


</script>

<template>
<UIPageFilter
    @show="onShow"
    :show-add-button="false"
    v-model:search="store.params.search"
    :search-loading="store.loading"
    @onSearch="filterEvent"
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
      v-model:search="componentStore.structureParams.search"
      @onSearch="componentStore._structures"
  />
  <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('userPage.form.role')}}</label>
  <n-select
      v-model:value="store.params.role"
      :options="store.roleList"
      label-field="name"
      value-field="id"
      clearable
      @update:value="filterEvent"
      :loading="store.roleLoading"
  />
</template>
</UIPageFilter>
</template>

<style scoped>

</style>