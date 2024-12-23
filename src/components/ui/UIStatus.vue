<script setup>
import {CheckmarkCircle24Filled} from "@vicons/fluent"
const props = defineProps({
  color:String,
  text:String,
})
</script>

<template>
<div class="flex justify-center" :class="`status-color-${color}`">
  <div class="status-box flex items-center gap-x-1 border rounded-2xl p-1 shadow w-auto cursor-pointer" >
    <n-icon size="18" class="status__icon">
      <CheckmarkCircle24Filled/>
    </n-icon>
    <span class="text-xs status__text">{{text}}</span>
  </div>
</div>
</template>

<style scoped lang="scss">
.status-color-success{
  .status-box{
    .status__text, .status__icon{
      @apply text-success
    }
    @apply border-success
  }
}
</style>

