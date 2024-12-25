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
  radioVal:{type:Array,default:[]},
  checkedVal:{type:Array,default:[]},
  getChildIds:{
    type:Function,
    required:true,
  },
  changeCheckVal:{
    type:Function,
    required:true,
  },

})

const emits = defineEmits(["onSelect", "onSelectAll"])


const onSelect = (v)=>{
  emits('onSelect',v)
}




const onOpen = (v)=>{
  props.changeCheckVal(v)
}

const onSelectRadio = (v)=>{
  emits('onSelectAll',v)
}

const isCheck =(id)=>{
  let idList = props.getChildIds(props.data, id)
  for(const id of idList){
    if(!(props.modelV.includes(id))){
      return false
    }
  }
  return true
}


</script>

<template>
  <div>
    <template v-for="(item, idx) in data" :key="idx">
      <div :style="{width:`calc(100% - ${(deep-1)*20}px)`, marginLeft:(deep-1)*20+'px' }"  class="w-full flex gap-x-1 cursor-pointer hover:bg-blue-50">
        <div class="w-[20px] flex justify-center items-center">
          <n-icon @click="onOpen(item)" size="18" class="text-gray-400" v-if="Array.isArray(item?.children) && item?.children.length>0" >
            <ChevronRight16Filled/>
          </n-icon>
        </div>
        <div @click="onSelect(item)" style="width: calc(100% - 40px)">
          <n-checkbox :checked="modelV.includes(item.id)"></n-checkbox>
          <span class="text-xs ml-2">{{item.name}}</span>
        </div>
        <div class="w-[20px] lex justify-center items-center">
          <n-radio
              v-if="Array.isArray(item?.children) && item?.children.length>0"
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
            :radioVal="radioVal"
            :checkedVal="checkedVal"
            :getChildIds="getChildIds"
            :changeCheckVal="changeCheckVal"
            @onSelect="onSelect"
            @onSelectAll="onSelectRadio"
        />
      </n-collapse-transition>

    </template>
  </div>


</template>

<style scoped>

</style>