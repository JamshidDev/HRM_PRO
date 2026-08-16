<script setup>
  // MetricCell.vue ning skeleton ko'rinishi: nuqta + yorliq, katta raqam, delta badge.
</script>

<template>
  <div class="flex-1 min-w-0 flex flex-col justify-center gap-1 px-4 py-1">
    <div class="flex items-center gap-2.5">
      <n-skeleton circle width="10px" height="10px" class="shrink-0" />
      <n-skeleton width="70%" height="14px" :sharp="false" />
    </div>
    <n-skeleton width="64px" height="20px" :sharp="false" class="mt-1" />
    <n-skeleton width="96px" height="16px" round class="mt-1" />
  </div>
</template>
