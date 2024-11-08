<script setup>
import {Organization48Regular, Delete16Regular, AddCircle16Regular, BuildingBank16Regular, Edit16Regular} from '@vicons/fluent'
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
        class="border border-surface-line rounded mb-2 px-2 py-1 relative cursor-pointer shadow flex items-center
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
            <n-icon size="24" class="text-purple-600">
              <Organization48Regular/>
            </n-icon>
          </template>
        </n-button>
        <n-button
            v-else
            quaternary
            circle
            type="primary"
            :disabled="elementId != null"
        >
          <template #icon>
            <n-icon size="24" class="text-purple-600 -rotate-90">
              <BuildingBank16Regular/>
            </n-icon>
          </template>
        </n-button>
      </div>
      <div class="flex flex-col pl-1" style="width: calc(100% - 160px)">
        <span class="font-bold text-primary">{{item.name}}</span>
        <span class="text-gray-400 text-sm font-normal">{{item.fullName}}</span>
      </div>
      <div class="flex gap-1 items-center w-[120px]">
        <n-button
            @click="onChange({
            type:'create',
            id:item.id,
            name:item.name,
            index:`${id}-${idx}`,
            })"
            tertiary
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
            type:'update',
            id:item.id,
            name:item.name,
            index:`${id}-${idx}`,
            })"
            tertiary
            circle
            type="error">
          <template #icon>
            <n-icon size="24" class="text-primary">
              <Edit16Regular/>
            </n-icon>
          </template>
        </n-button>
        <n-button
            @click="onChange({
            type:'delete',
            id:item.id,
            name:item.name,
            index:`${id}-${idx}`,
            })"
            tertiary
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