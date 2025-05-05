<script setup>
const props = defineProps({
  oneCount:{
    type:Number,
    default:0
  },
  twoCount:{
    type:Number,
    default:0
  },
})

const typeOne = computed(()=>{
  return props.oneCount>props.twoCount? 'success' : 'default'
})

const typeTwo = computed(()=>{
  return props.oneCount>props.twoCount? 'default' : 'error'
})

const isEqual = computed(()=>props.oneCount === props.twoCount)
</script>

<template>
  <div class="flex justify-end gap-4 items-center h-full">
    <n-button
        class="w-[80px]!"
        :secondary="!isEqual"
        :ghost="isEqual"
        :type="isEqual? 'default' : typeOne"
        size="tiny">
      P - <span class="font-bold pl-1"> {{oneCount}} </span>
    </n-button>

    <n-button
        class="w-[80px]!"
        :secondary="!isEqual"
        :ghost="isEqual"
        :type="isEqual? 'default' : typeTwo"
        size="tiny">
      F - <span class="font-bold pl-1"> {{twoCount}} </span>
    </n-button>
  </div>
</template>
