<script setup>
import LangDropdown from "@/components/general/LangDropdown.vue";
import {UIProfile} from "@/components/index.js";
const emits = defineEmits(["onChange"])







const onClick = ()=>{
  emits('onChange')
}
</script>

<template>
<div class="app_header bg-surface-section flex justify-between items-center p-4">
  <div class="flex">
    <div
        @click="onClick"
        class="mobile-control-btn flex justify-center items-center cursor-pointer w-[32px] h-[32px] bg-gray-900 rounded">
      <i class='bx bx-chevrons-left text-surface-section text-xl rotate-180'></i>
    </div>
  </div>
  <div class="flex justify-end items-center gap-4">
    <LangDropdown/>
    <UIProfile/>
  </div>
</div>
</template>

<style scoped>

</style>