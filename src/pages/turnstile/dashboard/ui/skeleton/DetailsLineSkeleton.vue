<script setup>
  // DetailsLine.vue ning skeleton ko'rinishi: chap chiziqcha + yorliq + raqam.
</script>

<template>
  <div class="relative flex items-center gap-2 pl-1 py-1.5 min-w-0">
    <n-skeleton width="2px" height="24px" :sharp="false" class="shrink-0" />
    <div class="flex-1 min-w-0 flex flex-col gap-1 justify-center">
      <n-skeleton width="72%" height="12px" :sharp="false" />
      <n-skeleton width="52px" height="14px" :sharp="false" />
    </div>
  </div>
</template>
