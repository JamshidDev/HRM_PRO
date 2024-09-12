<script setup>
import navigation from "@/layouts/Main/data/navigation.js"
import AppHeader from "@/layouts/Main/AppHeader.vue";
import {ChatVideo20Regular} from "@vicons/fluent"

const sidebar = ref(true)
const layoutClass = computed(()=>({
  open__sidebar:sidebar.value,
  close__sidebar:!sidebar.value,
}))
</script>

<template>
<div
    class="main__layout"
    :class="layoutClass"
>
  <div class="sidebar__section">
  </div>


  <div class="main__section">
    <div class="page__content">
      <AppHeader/>
    </div>
  </div>
</div>
</template>

<style scoped>

</style>