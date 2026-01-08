<script setup>
import {cn, notificationAlerts} from "@utils";

const props = defineProps({
  alert: {
    type: String,
    required: true,
  }
})
</script>
<template>
  <div :class="cn(
      'inline-flex gap-1 items-center p-1 px-2 rounded-lg',
      alert===notificationAlerts.info.value && 'bg-info/20 text-info',
      alert===notificationAlerts.success.value && 'bg-success/20 text-success',
      alert===notificationAlerts.warning.value && 'bg-warning/20 text-warning',
      alert===notificationAlerts.error.value && 'bg-danger/20 text-danger',
      alert===notificationAlerts.critical.value && 'bg-danger text-white',
  )">
    <component class="size-5" :is="notificationAlerts?.[alert]?.icon" />
    <span class="text-sm">{{notificationAlerts?.[alert]?.label}}</span>
  </div>
</template>