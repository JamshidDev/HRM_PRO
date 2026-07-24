<script setup>
  defineProps({
    checked: Boolean,
    label: { type: String, default: null }
  })
  defineEmits(['toggle'])
</script>

<template>
  <n-tooltip v-if="label" trigger="hover">
    {{ label }}
    <template #trigger>
      <n-checkbox :checked="checked" @click="$emit('toggle')" />
    </template>
  </n-tooltip>
  <n-checkbox v-else :checked="checked" @click="$emit('toggle')" />
</template>
