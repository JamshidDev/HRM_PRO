<script setup>
import {useTurnstileHikCentralStore} from "@/store/modules/index.js";
import {TreeData, UIUser} from "@/components/index.js"
const store = useTurnstileHikCentralStore()

const onClickNode = (v) => {
  store.payload.organization = v
  if(v?.length>0){
    const existIds = v[0].access_levels.map(i=>i.id)
    const selectedOption = store.accessLevels.filter(i=>existIds.includes(i.id))
    const unSelectedOption = store.accessLevels.filter(i=>!existIds.includes(i.id))
    store.accessLevels = [...selectedOption,...unSelectedOption]
    store.payload.access_levels = existIds
  }else{
    store.payload.access_levels = []
    store.accessLevels = store.originAccessLevels
  }
}

</script>
<template>
  <div class="organization-access-levels">
    <TreeData
        :multiple="false"
        :opened="true"
        :options="store.orgAccessLevels"
        :modelV="store.payload.organization"
        :checkedVal="store.structureCheck"
        @updateModel="onClickNode"
        @updateCheck="(v)=>store.structureCheck=v"
    >
    </TreeData>
  </div>
</template>
<style lang="scss">
.organization-access-levels {
  max-height: calc(100vh - 125px);
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