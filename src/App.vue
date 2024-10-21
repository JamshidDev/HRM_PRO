<script setup>
import ToastProvider from "@/components/Toast/ToastProvider.vue";
// import customTheme2 from "./assets/theme/theme.js"
const themeOverrides = {
  common: {
    primaryColor: '#0057ff',
    primaryColorHover: 'rgb(0,76,225)',
    primaryColorPressed: '#1162ff',
    primaryColorSuppl: '#1062ff',

    errorColor: '#E53935',
    errorColorHover: '#E53935',
    errorColorPressed: '#D32F2F',

    borderRadius: '8px',
  },
  Button: {
    fontSize: '10px',
  },
  Form: {
    labelFontSize: '10px',
    labelTextColor: 'rgb(121,121,121)'
  },

}
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider placement="top-right">
      <router-view />
      <ToastProvider/>
    </n-message-provider>
  </n-config-provider>

</template>

