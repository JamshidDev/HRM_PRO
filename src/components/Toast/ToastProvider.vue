<script setup>
import {useMessage} from 'naive-ui'
  import GlobalNotification from '@/components/notify/GlobalNotification.vue'
  import {useAppStore} from "@stores";
  const message = useMessage()
  window.$Toast = message
</script>

<template>
  <span></span>
  <GlobalNotification />
</template>
