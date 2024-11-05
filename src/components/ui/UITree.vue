<script setup>
import {Organization48Regular, Delete16Regular, AddCircle16Regular} from '@vicons/fluent'
const props = defineProps({
  children: Array,
  deep:{
    type:Number,
    default:0,
  },
  id:{
    type:String,
    default:'0',
  },
  elementId:{
    type:String,
    default:null,
  },
})

const emits = defineEmits(['onLoad', 'onChange'])

const onLoad = (v)=>{
  emits('onLoad', v)
}

const onChange = (v)=>{
  emits('onChange', v)
}


</script>

<template>
  <template v-for="(item, idx) in children" :key="idx">
    <div
        class="border border-surface-line rounded mb-2 px-2 py-1 relative cursor-pointer shadow flex items-center left-element-line
"
        v-bind:style="{marginLeft:`${deep*20}px`, width:`calc(100% - ${deep*20}px)`}"
    >
      <div class="flex justify-center items-center w-[40px]">
        <n-button
            v-if="item?.isHaveChild"
            :loading="elementId === `${id}-${idx}`"
            @click="onLoad({
              index:`${id}-${idx}`,
              id: item.id,
            })"
            quaternary
            circle
            type="primary"
            :disabled="elementId != null"
        >
          <template #icon>
            <n-icon size="24" class="text-purple-600 -rotate-90">
              <Organization48Regular/>
            </n-icon>
          </template>
        </n-button>
      </div>
      <div class="flex flex-col pl-1" style="width: calc(100% - 120px)">
        <span class="font-bold text-primary">{{item.name}}</span>
        <span class="text-gray-400 text-sm font-normal">{{item.fullName}}</span>
      </div>
      <div class="flex gap-2 items-center w-[80px]">
        <n-button
            @click="onChange({
            type:'create',
            id:item.id,
            index:`${id}-${idx}`,
            })"
            quaternary
            circle
            type="error">
          <template #icon>
            <n-icon size="24" class="text-success">
              <AddCircle16Regular/>
            </n-icon>
          </template>
        </n-button>
        <n-button
            @click="onChange({
            type:'delete',
            id:item.id,
            index:`${id}-${idx}`,
            })"
            quaternary
            circle
            type="error">
          <template #icon>
            <n-icon size="24" class="text-danger">
              <Delete16Regular/>
            </n-icon>
          </template>
        </n-button>
      </div>
    </div>
    <UITree
        :element-id="elementId"
        :children="item.children"
        @on-load="onLoad"
        @on-change="onChange"
        :deep="deep+1"
        :id="`${id}-${idx}`"
    ></UITree>
  </template>

</template>

<style scoped lang="scss">
.left-element-line{
  //&::before{
  //  content: ' ';
  //  position: absolute;
  //  width: 20px;
  //  height: 2px;
  //  background-color: red;
  //  left: -20px;
  //}
  //&::after{
  //  content: ' ';
  //  position: absolute;
  //  width: 2px;
  //  height: 66px;
  //  background-color: red;
  //  left: -20px;
  //  top: -10px;
  //}
}
</style>