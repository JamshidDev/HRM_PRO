<script setup>
const props = defineProps({
  status:{
    type:Boolean,
    default:false
  },
  text:{
    type:String,
    default:''
  },
  isButtonText:{
    type:Boolean,
    default:false
  }
})
</script>

<template>
  <n-button :text="isButtonText" :type="status? 'success' : 'error'" class="mr-1! mt-[2px]!" size="tiny" dashed bordered>
    {{text}}
    <template #icon>
                      <span class="relative flex size-2">
  <span :class="[status? 'animate-ping bg-success/90' : 'bg-danger/90']" class="absolute inline-flex h-full w-full  rounded-full  opacity-75"></span>
  <span :class="[status? 'bg-success' : 'bg-danger']" class="relative inline-flex size-2 rounded-full"></span>
</span>
    </template>
  </n-button>
</template>
