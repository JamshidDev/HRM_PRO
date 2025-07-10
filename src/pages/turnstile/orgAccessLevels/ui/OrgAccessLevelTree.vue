<script setup>
import {useTurnstileHikCentralStore} from "@/store/modules/index.js";
import {TreeData, UIUser} from "@/components/index.js"
const store = useTurnstileHikCentralStore()

const onClickNode = (v) => {
  store.payload.organization = v
  if(v.length){
    store.payload.access_levels = v[0].access_levels.map(i=>i.id)
  }else{
    store.payload.access_levels = []
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