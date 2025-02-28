<script setup lang="ts">
import PDF from "pdf-vue3";
defineProps({
  src: {
    type: String,
    default: "https://hymhub.github.io/pdf-vue3/mastering_javascript_design_patterns_fragment.pdf"
  }
})
</script>
<template>
  <n-dialog
    @update:value="console.log"
  >
    <PDF src="/demo.pdf" />
  </n-dialog>
</template>
