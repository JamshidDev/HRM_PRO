<script setup>

const props = defineProps({
  worker:{
    type:Object,
    default:null,
  },
  dayIndex:{
    type:Number,
    default:0
  }
})
</script>

<template>
  <template v-if="worker?.days?.[dayIndex]?.empty">
    <!--                  Empty box-->
  </template>
  <template v-else-if="worker?.days?.[dayIndex]?.isWorkDay">
    <div class="leading-[1.2] pt-3">{{worker?.days?.[dayIndex]?.startTime}}</div>
    <div class="leading-[1.2]">{{worker?.days?.[dayIndex]?.endTime}}</div>
    <div class="absolute top-[0] left-[0] w-[16px] h-[16px] bg-secondary/80 text-white text-xs rounded"> {{Math.floor(worker?.days?.[dayIndex]?.workTime/60)}}</div>
  </template>
  <template v-else>
    <div class="absolute top-[0] left-[0] w-[16px] h-[16px] bg-success/40 text-white text-xs rounded hover:bg-success/50"> D</div>
  </template>

</template>
