<script setup>
  defineProps({
    checked: Boolean,
    disabled: Boolean
  })
  defineEmits(['toggle'])
</script>

<template>
  <n-checkbox :checked="checked" :disabled="disabled" @click="$emit('toggle')" />
</template>
