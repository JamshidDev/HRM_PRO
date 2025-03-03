<script setup lang="ts">
import PDF from "pdf-vue3";
import {UIModal} from "@/components/index.js";

defineEmits(['close'])

defineProps({
  src: {
    type: String,
    required: true
  }
})


const visible = ref(true);

</script>

<template>
  <UIModal :width="1000" title="" @update:visible="$emit('close')" v-model:visible="visible">
    <PDF :src="src" style="height: 90vh" />
  </UIModal>

</template>
