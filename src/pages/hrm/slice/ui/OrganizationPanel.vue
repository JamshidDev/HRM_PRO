<script setup>
import {useComponentStore, useSliceStore} from "@/store/modules/index.js"
import {UITreeData, UITreeList} from "@/components/index.js"
const componentStore = useComponentStore()
const store = useSliceStore()

const onChange = (v)=>{
  store.organizations = v
}

onMounted(()=>{
  componentStore._structures()
})
</script>

<template>
<div class="flex w-full">
<UITreeList
    :options="componentStore.structureList"
    :modelV="store.organizations"
    :opened="true"
    :checkedVal="store.checkV"
    @updateModel="onChange"
    @updateCheck="(v)=>store.checkV=v"

/>
</div>
</template>
