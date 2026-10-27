<script setup>
  // «Xavflar» tab o'ramasi — keep-alive uchun bitta komponent (RiskMap + RiskCharts).
  import { defineAsyncComponent } from 'vue'
  import RiskMap from './RiskMap.vue'
  const RiskCharts = defineAsyncComponent(() => import('./RiskCharts.vue'))
</script>

<template>
  <div class="flex flex-col gap-4">
    <RiskMap />
    <RiskCharts />
  </div>
</template>
