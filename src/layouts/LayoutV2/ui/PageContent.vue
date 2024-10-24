<script setup>
import AppHeader from "./AppHeader.vue"

const emits = defineEmits(['onOpen'])

const onClick = ()=>{
  emits('onOpen')
}
</script>

<template>
<div class="page-content">
<AppHeader
    @on-change="onClick"
/>
</div>
</template>

<style scoped>

</style>