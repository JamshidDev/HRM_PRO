<script setup>
  import Utils from '@/utils/Utils.js'

  defineProps({
    name: { type: String, default: null },
    createdAt: { type: [String, Date], default: null }
  })

  const emits = defineEmits(['click'])
</script>

<template>
  <div
    @click="emits('click')"
    class="group flex flex-col hover:!text-primary hover:underline cursor-pointer"
  >
    <span class="text-sm line-clamp-2 leading-[1.2] font-medium">{{ name }}</span>
    <span
      v-if="createdAt"
      class="text-xs rounded-2xl text-secondary group-hover:!text-primary"
    >
      {{ Utils.timeHHMMWithMonth(createdAt) }}
    </span>
  </div>
</template>
