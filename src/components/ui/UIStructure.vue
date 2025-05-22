<script setup>
import {Search48Filled} from "@vicons/fluent"
import TreeOrg from "@/components/tree/TreeOrg.vue"
import {useDebounceFn} from "@vueuse/core"
import {useComponentStore} from "@/store/modules/index.js"
const store = useComponentStore()
const props = defineProps({
  multiple:{type:Boolean,default:true},
  modelV:{type:Array,default:[]},
  checkedVal:{type:Array,default:[]},
  disabled:{type:Boolean,default:false},
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

const inputVal = computed(()=>props.modelV.map((a)=>a.name).toString())

const onFocusEv = ()=>{
  if(store.structureList.length===0){
    store._structures()
  }
}
</script>

<template>
  <n-popover
      placement="bottom"
      trigger="click"
      width="540px"
      class="h-[460px] py-0! px-1"
  >
    <template #trigger>
      <n-badge
          :show="!disabled"
          :offset="[-10,-4]"
          class="w-full" :value="modelV.length" type="info">
        <n-input :disabled="disabled" @focus="onFocusEv" class="ui__structure-input w-full"  type="text" :value="inputVal?.toString()"  />

      </n-badge>
    </template>
    <div class="w-full h-[10px]"></div>
    <div class="w-full h-[404px] overflow-y-auto">
      <n-spin :show="store.structureLoading" class="w-full h-full">
        <TreeOrg
            :data="store.structureList"
            :modelV="modelV"
            :checkedVal="checkedVal"
            :getChildIds="getChildIds"
            :changeCheckVal="changeCheckVal"
            :multiple="multiple"
            @onSelect="onSelect"
            @onSelectAll="onSelectAll"
        />
      </n-spin>
    </div>
    <div class="w-full h-[40px] flex items-center">
      <n-input-group>
        <n-input
            size="small"
            v-model:value="searchModel"
            round
            :on-keyup="searchEvent"
            :loading="store.structureLoading"
        >
          <template #prefix>
            <n-icon :component="Search48Filled" />
          </template>
        </n-input>
        <n-button
            @click="emits('onSubmit')"
            type="primary"
            size="small"
            :loading="store.structureLoading"
        >
          {{$t("content.search")}}
        </n-button>
      </n-input-group>
    </div>
  </n-popover>


</template>
