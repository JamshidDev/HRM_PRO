<script setup>
import {cn, notificationTypes} from "@utils";

const props = defineProps({
  alert: {
    type: String,
    required: true,
  },
  small: Boolean
})
</script>
<template>
  <div :class="cn(
      'inline-flex gap-1 items-center py-1 px-2 rounded-lg',
      small && 'py-0.5 px-1 gap-0.5 rounded-sm',
      alert===notificationTypes.info.value && 'bg-info/20 text-info',
      alert===notificationTypes.success.value && 'bg-success/20 text-success',
      alert===notificationTypes.warning.value && 'bg-warning/20 text-warning',
      alert===notificationTypes.error.value && 'bg-danger/20 text-danger',
  )">
    <component :class="cn('size-5', small && 'size-3')" :is="notificationTypes?.[alert]?.icon" />
    <span :class="cn('text-sm', small && 'text-[10px]')">{{notificationTypes?.[alert]?.label}}</span>
  </div>
</template>