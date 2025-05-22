<script setup>
import {Search48Filled} from "@vicons/fluent"
import TreeOrg from "@/components/tree/TreeOrg.vue"
import {useDebounceFn} from "@vueuse/core"
import {useComponentStore} from "@/store/modules/index.js"
const store = useComponentStore()
const props = defineProps({
  multiple:{type:Boolean,default:true},
  loading:{type:Boolean,default:false},
  modelV:{type:Array,default:[]},
  checkedVal:{type:Array,default:[]},
  options:{type:Array, default:[]},
})


const searchModel = defineModel("search",{type:String,default:null })
const emits = defineEmits(["onSearch", "onSubmit","updateModel", "updateCheck", "defaultValue"])

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


watch(()=>props.options, (v)=>{
  if(isSingleOption.value){
    // emits('defaultValue',props.options)
  }
})


const isSingleOption = computed(()=> props.options.length===1 && (props.options[0]?.children? props.options[0].children?.length ===0 : true))

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
  store.depParams.search = searchModel.value
  store._departmentTree()
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

onMounted(()=>{
  if(isSingleOption.value && props.modelV.length === 0){
    console.log('default value is exist...')
    emits('defaultValue',props.options)
  }
})

</script>

<template>
  <n-popover
      placement="bottom"
      trigger="click"
      class="h-[400px] md:max-w-auto  py-0! px-1 max-w-(--top-activator-width) md:max-w-none! md:w-[400px]"
  >
    <template #trigger>
      <n-badge class="w-full" :value="modelV.length" type="info" :offset="[-10,-4]">
        <n-input :loading="loading" class="ui__structure-input w-full"  type="text" :value="inputVal?.toString()"  />
      </n-badge>
    </template>
    <div class="w-full h-[10px]"></div>
    <div class="w-full h-[344px] overflow-y-auto">
      <n-spin :show="loading" class="w-full h-full">
        <TreeOrg
            :data="options"
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
            :loading="loading"
        >
          <template #prefix>
            <n-icon :component="Search48Filled" />
          </template>
        </n-input>
        <n-button
            @click="emits('onSubmit')"
            type="primary"
            size="small"
            :loading="loading"
        >
          {{$t("content.search")}}
        </n-button>
      </n-input-group>
    </div>
  </n-popover>


</template>
