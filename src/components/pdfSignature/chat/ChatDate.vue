<script setup>
const props = defineProps({
  date:{
    type: String,
    default:null
  }
})



</script>

<template>
  <div class="flex justify-center w-full">
      <div class="inline-block  text-primary px-4 py-2 text-xs">{{date}}</div>
  </div>
</template>
