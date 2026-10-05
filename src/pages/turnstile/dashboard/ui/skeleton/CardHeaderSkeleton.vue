<script setup>
  // CardHeader.vue skeleton'i: 28px chip + sarlavha (o'lchamlar bir xil — karta bo'yi sakramaydi).
  defineProps({
    titleWidth: {
      type: String,
      default: '55%'
    }
  })
</script>

<template>
  <div class="flex items-center gap-1 pl-2 pr-1 py-3 w-full">
    <n-skeleton width="28px" height="28px" :sharp="false" class="shrink-0 rounded-lg" />
    <n-skeleton :width="titleWidth" height="14px" :sharp="false" />
  </div>
</template>
