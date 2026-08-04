<script setup>
  defineProps({
    number: { type: [String, Number], default: null },
    type: { type: String, default: 'primary' }
  })
</script>

<template>
  <n-button v-if="number" class="font-medium" :type="type" size="tiny" round dashed>
    {{ number }}
  </n-button>
</template>
