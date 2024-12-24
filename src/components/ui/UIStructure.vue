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
  modelV:{type:Array,default:[]}
})

const emits = defineEmits(["onSelect"])


const checkedVal = ref([])
const radioVal = ref([])

const onSelect = (v)=>{
  emits('onSelect',v)
}

const onOpen = (v)=>{
  if(checkedVal.value?.includes(v.id)){
    checkedVal.value = checkedVal.value.filter((x)=>x !== v.id)
  }else{
    checkedVal.value.push(v.id)
  }
}

const onSelectRadio = (v)=>{
  radioVal.value.push(v.id)
}

</script>

<template>
  <div>
    <template v-for="(item, idx) in data" :key="idx">
      <div :style="{width:`calc(100% - ${deep*20}px)`, marginLeft:deep*20+'px' }"  class="w-full flex gap-x-1 cursor-pointer hover:bg-blue-50 rounded">
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
              :checked="radioVal.includes(item.id)"
              :value="item.id"
              name="basic-demo"
          />
        </div>
      </div>
      <n-collapse-transition :show="checkedVal.includes(item.id)">
        <UIStructure
            :deep="deep+1"
            :data="item?.children"
            :modelV="modelV"
            @onSelect="onSelect"
        />
      </n-collapse-transition>

    </template>
  </div>


</template>

<style scoped>

</style>