<script setup>
import {ChevronRight16Filled} from "@vicons/fluent"


const props = defineProps({
  data:{
    type:Array,
    default:[],
  },
  deep:{
    type:Number,
    default:1,
  },
  modelV:{type:Array,default:[]},
  checkedVal:{type:Array,default:[]},
  getChildIds:{
    type:Function,
    required:true,
  },
  changeCheckVal:{
    type:Function,
    required:true,
  },
  multiple:{type:Boolean,default:false},
  opened:{type:Boolean,default:false},
  width:{
    type:Number,
    default:null
  }

})

const slot = useSlots()

const emits = defineEmits(["onSelect", "onSelectAll"])


const onSelect = (v)=>{
  if(v.group !== 1 || props.multiple){
    emits('onSelect',v)
  }

}




const onOpen = (v)=>{
  props.changeCheckVal(v)
}

const onSelectRadio = (v)=>{
  emits('onSelectAll',v)
}

const isCheck =(id)=>{
  let idList = props.getChildIds(props.data, id).map(e=>e.id)
  const valList =props.modelV.map((a)=>a.id)
  for(const id of idList){
    if(!(valList.includes(id))){
      return false
    }
  }
  return true
}



</script>

<template>
  <div>
    <template v-for="(item, idx) in data" :key="idx">
      <div
          :style="{minWidth:width? width+'px':'100%'}"
          class="flex cursor-pointer hover:bg-surface-100 ui__tree-hover items-stretch"
          :class="[modelV.includes(item) && 'bg-surface-100']"
      >

        <template v-if="deep>1">
          <div v-for="(item,idx) in (deep-1)" :key="idx" class="w-[20px]"></div>
        </template>

        <div v-if="Array.isArray(item?.children) && item?.children.length>0" class="w-[20px] max-w-[20px] overflow-hidden flex justify-center items-center">
          <n-icon @click="onOpen(item)" size="18" class="text-gray-400" >
            <ChevronRight16Filled class="transition" :class="!checkedVal.includes(item.id) && 'rotate-90'"/>
          </n-icon>
        </div>
        <div v-else
             :class="['deep-'+deep, (data.length === idx+1 || (data.length === idx+2 && data?.[idx+1].children?.length>0 )) && 'line-half']"
             class="w-[20px] border__center-line border__center-content"
        ></div>



        <div @click="onSelect(item)" :style="{width:`calc(100% - ${deep>1? (deep*20) : 40}px)`}" class="leading-4 flex items-center truncate" >
          <n-checkbox
              v-if="!$slots.title"
              :disabled="Boolean(item.group && !multiple)"
              :checked="modelV.map((a)=>a.id).includes(item.id)"
          ></n-checkbox>
          <span class="ml-2 w-full text-wrap py-1">
            <slot name="title" :data="item" >{{item.name}}</slot>
          </span>
        </div>
        <div v-if="Array.isArray(item?.children) && item?.children.length>0 && multiple" class="w-[20px] justify-center items-center">
          <n-radio

              @click="onSelectRadio(item)"
              :checked="isCheck(item.id)"
              :value="item.id"
              name="basic-demo"
          />
        </div>
      </div>


      <n-collapse-transition :show="opened? !checkedVal.includes(item.id) : checkedVal.includes(item.id)">
        <Tree
            :deep="deep+1"
            :width="width"
            :opened="opened"
            :data="item?.children"
            :modelV="modelV"
            :checkedVal="checkedVal"
            :getChildIds="getChildIds"
            :changeCheckVal="changeCheckVal"
            :multiple="multiple"
            @onSelect="onSelect"
            @onSelectAll="onSelectRadio"

        >
          <template v-if="slot.title" #title="{data}">
            <slot name="title" :data="data"></slot>
          </template>
        </Tree>
      </n-collapse-transition>

    </template>
  </div>


</template>

<style scoped>

</style>