<script setup>
import {useTurnstileOrganizationStore} from "@/store/modules/index.js";
import {TreeData, UIUser} from "@/components/index.js"
const store = useTurnstileOrganizationStore()

const onClickNode = (v) => {
  store.payload.organization_id = v
  if(v.length){
    store._show()
  }
}

</script>
<template>
  <div class="organization-turnstile">
    <TreeData
        :multiple="false"
        :opened="true"
        :options="store.tree"
        :modelV="store.payload.organization_id"
        :checkedVal="store.structureCheck"
        @updateModel="onClickNode"
        @updateCheck="(v)=>store.structureCheck=v"
    >
    </TreeData>
  </div>
</template>
<style lang="scss">
.organization-turnstile {
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