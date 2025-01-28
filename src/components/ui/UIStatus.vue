<script setup>
import {Timer16Regular, Eye16Filled, CheckmarkCircle24Filled, Checkmark28Filled} from "@vicons/fluent"
const props = defineProps({
  status:String,
  size:String,
})

const statusList = [
  {
    name:"Process",
    type:'warning',
    icon:Timer16Regular,
  },
  {
    name:"Read",
    type:'default',
    icon:Checkmark28Filled,
  },
  {
    name:"Success",
    type:'success',
    icon:CheckmarkCircle24Filled,
  },
  {
    name:"Rejected",
    type:'error',
    icon:Eye16Filled,
  },
  {
    name:"Deleted",
    type:'error',
    icon:Eye16Filled,
  },
]

const type = computed(()=>{
  const v = statusList.filter((x)=>x.name === props.status)
  if(Boolean(v.length)) return v[0].type
  else return 'primary'
})

const icon = computed(()=>{
  const v = statusList.filter((x)=>x.name === props.status)
  if(Boolean(v.length)) return v[0].icon
  else return Eye16Filled
})

</script>

<template>
<div class="w-full flex justify-center items-center">
  <n-button :type="type" size="tiny">
    <template #icon>
      <component :is="icon" />
    </template>
    {{$t(`content.${status}`)}}
  </n-button>
</div>
</template>


