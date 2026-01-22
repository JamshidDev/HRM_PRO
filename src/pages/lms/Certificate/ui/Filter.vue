<script setup>
import {useComponentStore, useLmsCertificateStore} from "@stores"
import {UIPageFilter, UISelect} from "@components"
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

onMounted(()=>{
  fetchStructure()
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