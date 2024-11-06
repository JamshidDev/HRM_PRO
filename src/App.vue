<script setup>
import ToastProvider from "@/components/Toast/ToastProvider.vue";
import themeOverrides from "./assets/theme/theme.js"
import AppLayout from "@/layouts/AppLayout.vue";
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider placement="top-right">
      <n-dialog-provider>
        <AppLayout/>
        <ToastProvider/>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

