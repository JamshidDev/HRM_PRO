<script setup>
import {UISelect} from "@/components/index.js"
import {useComponentStore, useReport2Store} from "@/store/modules/index.js"
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const componentStore = useComponentStore()
const store = useReport2Store()

const onChangeOrg = (v)=>{
  if(!accStore.checkAction(accStore.pn.hrReportRead)) return
  store.onChangeOrg(v)
}

onMounted(()=>{
  componentStore._structures()
})
</script>

<template>
<div class="w-full grid grid-cols-12">
  <div class="col-span-3 ">
    <label class="text-textColor1 text-sm pl-2">{{$t('content.organization')}}</label>

    <UISelect
        :options="componentStore.structureList"
        :model-v="store.params.organization_id"
        @updateModel="onChangeOrg"
        :checkedVal="store.orgCheck"
        @updateCheck="(v)=>store.orgCheck=v"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        :loading="componentStore.structureLoading"
        :multiple="false"
        :auto-select="true"
    />


  </div>
  <div class="col-span-9">

  </div>
</div>
</template>

<style scoped>

</style>