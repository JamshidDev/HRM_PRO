<script setup>
import Tree from "@/components/tree/Tree.vue"
import {useDebounceFn} from "@vueuse/core"
import {useComponentStore} from "@/store/modules/index.js"
const store = useComponentStore()

const props = defineProps({
  multiple:{type:Boolean,default:true},
  opened:{type:Boolean,default:false},
  modelV:{type:Array,default:[]},
  checkedVal:{type:Array,default:[]},
  options:{type:Array,default:[]},
  minWidth:{type:Number,default:undefined},
  showCheck:{type:Boolean,default:false},
})


const searchModel = defineModel("search",{type:String,default:null })
const emits = defineEmits(["onSearch", "onSubmit","updateModel", "updateCheck"])

const onSelect = (v)=>{
  let list = []
  if(props.modelV.map((a)=>a.id).includes(v.id)){
    list = props.modelV.filter((x)=>x.id !== v.id)
  }else{
    if(props.multiple){
      list = props.modelV
      list.push(v)

    }else{
      list = [v]
    }
  }
  emits('updateModel',list)
}

const onSelectAll = (v)=>{

  const idList = getChildIds(store.structureList, v.id)
  let list = []

  const checkRadio = (valList=[], idList=[])=>{
    for(const id of idList){
      if(!(valList.includes(id))){
        return false
      }
    }
    return  true
  }

  if(checkRadio(props.modelV.map((a)=>a.id),idList.map(e=>e.id) )){
    // Remove elements
    list = props.modelV.filter((x)=>!(idList.map((a)=>a.id).includes(x.id)))
  }
  else{
    // Add elements
    idList.forEach((y)=>{
      if(!(props.modelV.map((a)=>a.id).includes(y.id))){
        list.push(y)
      }
    })
    list = [...props.modelV, ...list]
  }
  emits('updateModel',list)
}

const searchEvent = useDebounceFn(() => {
  emits('onSearch', searchModel.value )
  store.structureParams.search = searchModel.value
  store._structures()
}, 300,)

const getChildIds = (tree, elementId)=>{
  const result = []

  const findAndCollect = (node)=>{
    if(node.id === elementId){
      collectChildIds(node)
      return true
    }
    for(const child of node.children){
      if(findAndCollect(child)) return true
    }
    return false
  }

  const collectChildIds = (node)=>{
    result.push(node)
    for (const child of node.children){
      collectChildIds(child)
    }
  }

  for(const items of tree){
    findAndCollect(items)
  }


  return result
}

const changeCheckVal = (v)=>{
  let list = []
  if(props.checkedVal?.includes(v.id)){
    list = props.checkedVal.filter((x)=>x !== v.id)
  }else{
    list = props.checkedVal
    list.push(v.id)
  }

  emits('updateCheck',list)
}

const slot = useSlots()

</script>

<template>
  <Tree
      :width="minWidth"
      :data="options"
      :modelV="modelV"
      :checkedVal="checkedVal"
      :getChildIds="getChildIds"
      :changeCheckVal="changeCheckVal"
      @onSelect="onSelect"
      @onSelectAll="onSelectAll"
      :opened="opened"
      :showCheck="showCheck"
  >
        <template #title="{data}" v-if="slot.title" >
          <slot  name="title" :data="data"></slot>
        </template>

  </Tree>

</template>
