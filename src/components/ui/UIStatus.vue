<script setup>
import {Timer16Regular, Eye16Filled, CheckmarkCircle24Filled, Circle20Filled} from "@vicons/fluent"
const props = defineProps({
  status:Object,
  size:{
    type:String,
    default:'tiny'
  },
})

const statusList = [
  {
    id:1,
    name:"Process",
    type:'warning',
    icon:Timer16Regular,
  },
  {
    id:2,
    name:"Read",
    type:'default',
    icon:Eye16Filled,
  },
  {
    id:3,
    name:"Success",
    type:'success',
    icon:CheckmarkCircle24Filled,
  },
  {
    id:4,
    name:"Rejected",
    type:'error',
    icon:Eye16Filled,
  },
  {
    id:5,
    name:"Deleted",
    type:'error',
    icon:Eye16Filled,
  },
  {
    id:6,
    name:"Active",
    type:'success',
    icon:Circle20Filled,
  },
  {
    id:7,
    name:"DeActive",
    type:'error',
    icon:Circle20Filled,
  },
]

const type = computed(()=>{
  const v = statusList.filter((x)=>x.id === props.status?.id)
  if(Boolean(v.length)) return v[0].type
  else return 'primary'
})

const icon = computed(()=>{
  const v = statusList.filter((x)=>x.id === props.status?.id)
  if(Boolean(v.length)) return v[0].icon
  else return Eye16Filled
})

</script>

<template>
<div class="flex justify-center items-center">
  <n-button :type="type" :size="size" dashed>
    <template #icon>
      <component :is="icon" />
    </template>
    {{status?.name}}
  </n-button>
</div>
</template>


