<script setup>
const props = defineProps({
  url:{
    type:String,
    default:null
  }
})
</script>

<template>
  <iframe
      class="relative z-[1]"
      :src="url"
      width="100%"
      style="height:calc(100% + 30px)"

  >
  </iframe>
</template>
