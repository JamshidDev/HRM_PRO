<script setup>

const props = defineProps({
  data:{
    type: Array,
    default:[],
  },
  max:{
    type: Number,
    default: 4,
  }
})
</script>

<template>
<div>
  <n-avatar-group :options="data" :size="40" :max="max">
    <template #avatar="{ option: { photo, fullName } }">
      <n-tooltip>
        <template #trigger>
          <n-avatar :src="photo" />
        </template>
        {{ fullName }}
      </n-tooltip>
    </template>
    <template #rest="{ options: restOptions, rest }">
      <n-avatar>+{{ rest }}</n-avatar>
    </template>
  </n-avatar-group>
</div>
</template>
