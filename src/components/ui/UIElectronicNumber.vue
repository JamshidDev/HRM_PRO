<script setup>
  // Hujjatning elektron raqami (UTY-482917) — jadval katakchasi uchun.
  defineProps({
    value: { type: String, default: null }
  })
</script>

<template>
  <span class="whitespace-nowrap text-sm leading-5 font-medium text-fig-text-primary tabular-nums">
    {{ value || '—' }}
  </span>
</template>
