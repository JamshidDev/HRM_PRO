<script setup>
import TopDevices from './TopDevices.vue'
import DailyEventChart from './DailyEventChart.vue'
</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-8">
      <DailyEventChart/>
    </div>
    <div class="col-span-4">
      <TopDevices/>
    </div>
  </div>
</template>
