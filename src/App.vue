<script setup>
import ToastProvider from "@/components/Toast/ToastProvider.vue";
</script>

<template>
  <n-message-provider placement="top-right">
    <router-view />
    <ToastProvider/>
  </n-message-provider>

</template>

