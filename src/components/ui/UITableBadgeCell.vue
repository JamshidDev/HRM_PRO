<script setup>
  import UIChip from './UIChip.vue'

  // Jadvaldagi hujjat raqami — umumiy chip ko'rinishida (UIChip).
  defineProps({
    number: { type: [String, Number], default: null },
    // naive-ui turi ('primary', 'error'…) — UIChip rangiga aylantiriladi.
    type: { type: String, default: 'primary' }
  })
</script>

<template>
  <UIChip v-if="number" :label="number" :tone="type" tooltip />
</template>
