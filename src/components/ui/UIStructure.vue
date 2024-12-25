<script setup>
import {Search48Filled} from "@vicons/fluent"
import TreeOrg from "@/components/tree/TreeOrg.vue"
import {useDebounceFn} from "@vueuse/core"
import {useComponentStore} from "@/store/modules/index.js"
const store = useComponentStore()

const props = defineProps({
  modelV:{type:Array,default:[]},
})

const inputVal = ref([])
const radioVal = ref([])
const checkedVal = ref([])

const searchModel = defineModel("search",{type:String,default:null })
const emits = defineEmits(["onSearch", "onSubmit","updateModel"])

const onSelect = (v)=>{
  let list = []
  if(props.modelV.includes(v.id)){
    list = props.modelV.filter((x)=>x !== v.id)
  }else{
    list = props.modelV
    list.push(v.id)
  }
  emits('updateModel',list)

  if(inputVal.value.includes(v.name)){
    inputVal.value = inputVal.value.filter((x)=>x !== v.name)
  }else{
    inputVal.value.push(v.name)
  }
}

const onSelectAll = (v)=>{

  const idList = getChildIds(store.structureList, v.id)
  let list = []
  if(radioVal.value.includes(v.id)){
    // Remove elements
    radioVal.value =radioVal.value.filter((x)=>x !== v.id)

    list = props.modelV.filter((x)=>!(idList.includes(x)))

  }
  else{
    // Add elements
    radioVal.value.push(v.id)
    idList.forEach((id)=>{
      if(!(props.modelV.includes(id))){
        list.push(id)
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
     result.push(node.id)
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
  if(checkedVal.value?.includes(v.id)){
    checkedVal.value = checkedVal.value.filter((x)=>x !== v.id)
  }else{
    checkedVal.value.push(v.id)
  }
}




onMounted(()=>{
  store._structures()
})
</script>

<template>
  <n-popover
      placement="bottom"
      trigger="click"
      width="460px"
      class="h-[400px] !py-0"
  >
    <template #trigger>
      <n-badge :value="modelV.length" type="info">
        <n-input class="ui__structure-input"  type="text" :value="inputVal?.toString()" :placeholder="$t('content.choose')" />
      </n-badge>
    </template>
    <div class="w-full h-[10px]"></div>
    <div class="w-full h-[344px] overflow-y-auto">
      <n-spin :show="store.structureLoading" class="w-full h-full">
        <TreeOrg
            :data="store.structureList"
            :modelV="modelV"
            :radioVal="radioVal"
            :checkedVal="checkedVal"
            :getChildIds="getChildIds"
            :changeCheckVal="changeCheckVal"
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
            round :placeholder="$t('content.search')"
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
