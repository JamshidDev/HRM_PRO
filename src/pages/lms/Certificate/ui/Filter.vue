<script setup>
import {useComponentStore, useLmsCertificateStore} from "@stores"
import {SuperSelect, UIPageFilter, UISelect} from "@components"
import Utils from "@utils/Utils.js"


const store = useLmsCertificateStore()
const componentStore = useComponentStore()

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}


const filterEvent = ()=>{

}

const onChangeStructure = (v) => {
  store.params.organization_id = v
  filterEvent()
}

const fetchStructure = ()=>{
  if(componentStore.structureList.length> 0) return
  componentStore._structures()
}

const fetchGroups = ()=>{
  if(store.group.list.length> 0) return
  store._group()
}

const onSearchGr =()=>{
  store.group.params.page = 1
  store._group()
}

const onScrollGr =()=>{
  store.group.params.page += 1
  store._group()
}

onMounted(()=>{
  fetchStructure()
  fetchGroups()
})


</script>

<template>
  <UIPageFilter
      v-model:search="store.params.search"
      @onSearch="onSearch"
      :search-loading="store.loading"
      :show-add-button="false"
      :show-filter-button="false"

  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
          $t('actionLog.table.structure')
        }}</label>
      <UISelect
          :options="componentStore.structureList"
          :modelV="store.params.organizations"
          @defaultValue="(v) => (store.params.organizations = v)"
          @updateModel="onChangeStructure"
          :checkedVal="store.structureCheck2"
          @updateCheck="(v) => (store.structureCheck2 = v)"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          @onSubmit="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{ $t('content.year') }}</label>
      <SuperSelect
          v-model:value="store.params.group_id"
          v-model:search="store.group.params.search"
          :options="store.group.list"
          :loading="store.group.loading"
          @onScrollEv="onScrollGr"
          @onSearch="onSearchGr"
      />

      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{ $t('content.year') }}</label>
      <n-select
          class="w-full"
          v-model:value="store.params.year"
          :options="Utils.yearList"
          label-field="name"
          value-field="id"
          @update:value="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{ $t('content.month') }}</label>
      <n-select
          class="w-full"
          v-model:value="store.params.month"
          :options="Utils.monthList"
          label-field="name"
          value-field="id"
          @update:value="filterEvent"
      />
    </template>

  </UIPageFilter>
</template>