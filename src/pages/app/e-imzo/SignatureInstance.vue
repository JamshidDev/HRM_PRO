<script setup>
import {useSignatureStore} from "@/store/modules/index.js"
const store = useSignatureStore()










onMounted(async ()=>{
  window.onload = await store._initialSignature
})
</script>

<template>

</template>

<style scoped>

</style>