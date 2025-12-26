<script setup>
  const props = defineProps({
    worker: {
      type: Object,
      default: null
    },
    dayIndex: {
      type: Number,
      default: 0
    }
  })
</script>

<template>
  <template v-if="worker?.days?.[dayIndex]?.empty">
    <!--                  Empty box-->
  </template>
  <template v-else-if="worker?.days?.[dayIndex]?.isWorkDay">
    <div
      class="flex items-center w-full justify-between h-1/2 border-b border-dashed border-surface-line px-2"
    >
      <div class="w-[16px] h-[16px] bg-surface-ground text-dark text-xs rounded">
        {{ Math.round(worker?.days?.[dayIndex]?.workTime / 60) }}
      </div>
      <div>
        <template v-if="!worker?.days?.[dayIndex].children">
          <span class="leading-[1.2] mr-2">{{ worker?.days?.[dayIndex]?.startTime }}</span>
          <span class="leading-[1.2]">{{ worker?.days?.[dayIndex]?.endTime }}</span>
        </template>
      </div>
    </div>
    <div class="flex items-center w-full justify-between h-1/2 border-dashed px-2">
      <div
        :class="worker?.days?.[dayIndex]?.factClass"
        class="w-[16px] h-[16px] text-white text-xs rounded"
      >
        {{ Math.round(worker?.days?.[dayIndex]?.factWorkTime / 60) }}
      </div>
      <div>
        <span class="leading-[1.2] mr-2 w-[30px] inline-block">{{
          worker?.days?.[dayIndex]?.firstIn || '-:-'
        }}</span>
        <span class="leading-[1.2] w-[30px] inline-block">{{
          worker?.days?.[dayIndex]?.lastOut || '-:-'
        }}</span>
      </div>
    </div>
  </template>
  <template v-else>
    <div
      class="flex items-center w-full justify-between h-1/2 border-b border-dashed border-surface-line px-2"
    >
      <div class="w-[16px] h-[16px] bg-success/40 hover:bg-success/50 text-white text-xs rounded">
        D
      </div>
    </div>
    <div class="flex items-center w-full justify-between h-1/2 border-dashed px-2">
      <div class="w-[16px] h-[16px] text-secondary text-xs rounded">
        {{ Math.round(worker?.days?.[dayIndex]?.factWorkTime / 60) }}
      </div>
      <div>
        <span class="leading-[1.2] mr-2 w-[30px] inline-block">{{
          worker?.days?.[dayIndex]?.firstIn || '-:-'
        }}</span>
        <span class="leading-[1.2] w-[30px] inline-block">{{
          worker?.days?.[dayIndex]?.lastOut || '-:-'
        }}</span>
      </div>
    </div>
  </template>
</template>
