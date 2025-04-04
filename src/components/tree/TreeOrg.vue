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

})

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
      <div class="w-full flex cursor-pointer hover:bg-blue-50 ui__tree-hover">

        <template v-if="deep>1">
          <div v-for="(item,idx) in (deep-1)" :key="idx" class="w-[20px] h-[20px] border__center-line"></div>
        </template>

        <div v-if="Array.isArray(item?.children) && item?.children.length>0" class="w-[20px] max-w-[20px] overflow-hidden flex justify-center items-center">
          <n-icon @click="onOpen(item)" size="18" class="text-gray-400" >
            <ChevronRight16Filled class="transition" :class="checkedVal.includes(item.id) && 'rotate-90'"/>
          </n-icon>
        </div>
        <div v-else :class="'deep-'+deep" class="w-[20px] h-[20px] border__center-line border__center-content"></div>



        <div @click="onSelect(item)" :style="{width:`calc(100% - ${deep>1? (deep*20) : 40}px)`}" class="leading-4 flex items-center truncate">
          <n-checkbox
              :disabled="Boolean(item.group && !multiple)"
              :checked="modelV.map((a)=>a.id).includes(item.id)"
          ></n-checkbox>
          <span class="text-xs ml-2">{{item.name}}</span>
        </div>
        <div class="w-[20px] lex justify-center items-center">
          <n-radio
              v-if="Array.isArray(item?.children) && item?.children.length>0 && multiple"
              @click="onSelectRadio(item)"
              :checked="isCheck(item.id)"
              :value="item.id"
              name="basic-demo"
          />
        </div>
      </div>
      <n-collapse-transition :show="checkedVal.includes(item.id)">
        <TreeOrg
            :deep="deep+1"
            :data="item?.children"
            :modelV="modelV"
            :checkedVal="checkedVal"
            :getChildIds="getChildIds"
            :changeCheckVal="changeCheckVal"
            :multiple="multiple"
            @onSelect="onSelect"
            @onSelectAll="onSelectRadio"
        />
      </n-collapse-transition>

    </template>
  </div>


</template>

<style scoped>

</style>