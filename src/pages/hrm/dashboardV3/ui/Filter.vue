<script setup>
import {UISelect} from "@/components/index.js"
import {useComponentStore, useDashboardStore} from "@/store/modules/index.js"
import {ArrowSync16Regular} from '@vicons/fluent'

const componentStore = useComponentStore()
const store = useDashboardStore()

const updateModel = (v)=>{
  store.params.organizations=v
  if(store?.activeDetail){
    store.params.page = 1
    store._index_detail()
  }
  store._index()
}

const refresh = ()=>{
  if(store?.activeDetail){
    store._index_detail()
    return
  }
  store._index(true)
}

onMounted(() => {
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
})


</script>

<template>
  <div class="flex gap-3">
    <n-button type="primary" tertiary @click="refresh" :disabled="store.loading || store.detailLoading">
      {{$t('content.refresh')}}
      <template #icon>
        <ArrowSync16Regular />
      </template>
    </n-button>
    <div class="w-[400px]">
      <UISelect
          :options="componentStore.structureList"
          :modelV="store.params.organizations"
          @updateModel="updateModel"
          :checkedVal="store.structureCheck"
          @updateCheck="(v)=>store.structureCheck=v"
          :loading="componentStore.structureLoading"
      />
    </div>
  </div>

</template>

<style scoped>

</style>