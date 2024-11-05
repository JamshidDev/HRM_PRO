<script setup>
import {useOrganizationStore} from "@/store/modules/index.js"
import {UITree} from "@/components/index.js"

const store = useOrganizationStore()








const onLoad = (v)=>{
  store.elementId = v.id
  store.indexPath = v.index
  store._show()
}

const onChange = (v)=>{
  console.log(v)
  if(v.type === 'create'){
    createNested(v)
  }
}

const createNested = (v)=>{
  store.resetForm()
  store.elementId =v.id
  store.nestedPath = v.index
  store.payload.parent_id = v.id
  store.visibleType = true
  store.nestedElement = true
  store.visible = true
}






</script>

<template>
    <UITree
        :children="store.list"
        @on-load="onLoad"
        @on-change="onChange"
        :element-id="store.indexPath"
    />
</template>