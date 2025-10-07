<script setup>
import {useTurnstileHikCentralStore, useComponentStore} from "@/store/modules/index.js";
import {TreeData} from "@/components/index.js"

const store = useTurnstileHikCentralStore()
const componentStore = useComponentStore()

const onClickNode = (v) => {
  store.payload.organization = v
  store.payload.access_levels = []

  if(v.length>0){
    store.elementId = v[0]?.id
    store._org_levels()
  }

}

let timer = null
const onSearchEv = ()=>{
  clearTimeout(timer)
  timer = setTimeout(()=>{
    componentStore._structures()
  },600)

}

</script>
<template>
  <div class="w-full flex gap-4 border-surface-line p-2">
    <n-input
        :loading="componentStore.structureLoading"
        clearable
        class="w-[calc(100%-200px)] skip-format"
        v-model:value="componentStore.structureParams.search"
        type="text"
        :placeholder="$t('content.search')"
        :on-keyup="onSearchEv"
        @clear="onSearchEv"
    />
    <n-checkbox
        class="w-[120px] border border-surface-line rounded-md flex justify-center pt-1"
        v-model:checked="store.short" >
      {{store.short? $t('content.long') : $t('content.short')}}
    </n-checkbox>
  </div>
  <div class="organization-access-levels pt-2">
    <TreeData
        :multiple="false"
        :opened="true"
        :options="componentStore.structureList"
        :modelV="store.payload.organization"
        :checkedVal="store.structureCheck"
        @updateModel="onClickNode"
        @updateCheck="(v)=>store.structureCheck=v"
        :short="store.short"

    >

    </TreeData>
  </div>
</template>
<style lang="scss">
.organization-access-levels {
  max-height: calc(100vh - 175px);
  height: calc(100vh - 125px);
  overflow: auto;
  tr {
    cursor: pointer;
  }

  .active {
    background: #ddeff9 !important;
  }

}
</style>