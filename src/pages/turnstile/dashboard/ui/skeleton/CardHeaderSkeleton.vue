<script setup>
  // CardHeader.vue ning skeleton ko'rinishi: 28px chip + sarlavha/tavsif qatorlari.
  // O'lchamlar CardHeader bilan bir xil (pl-2 pr-1 py-3, 14px/12px matn) —
  // shuning uchun ma'lumot kelganda karta bo'yi sakramaydi.
  defineProps({
    titleWidth: {
      type: String,
      default: '55%'
    },
    subtitleWidth: {
      type: String,
      default: '80%'
    }
  })
</script>

<template>
  <div class="flex items-center gap-1 pl-2 pr-1 py-3 w-full">
    <n-skeleton width="28px" height="28px" :sharp="false" class="shrink-0 rounded-lg" />
    <div class="flex-1 min-w-0 flex flex-col gap-1 justify-center">
      <n-skeleton :width="titleWidth" height="14px" :sharp="false" />
      <n-skeleton :width="subtitleWidth" height="10px" :sharp="false" />
    </div>
  </div>
</template>
