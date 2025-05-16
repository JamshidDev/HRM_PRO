<script setup>
import {UISelect} from "@/components/index.js"
import {useComponentStore, useDashboardStore} from "@/store/modules/index.js"

const componentStore = useComponentStore()
const store = useDashboardStore()

const updateModel = (v)=>{
  store.params.organizations=v
  store._index()
}

onMounted(() => {
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
})


</script>

<template>
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

</template>

<style scoped>

</style>