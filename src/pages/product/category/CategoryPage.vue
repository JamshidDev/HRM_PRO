<script setup>
import FilterApp from "@/components/FilterApp/FilterApp.vue";
import {UIDrawer} from "@/components/index.js";
</script>

<template>
  <div class="mx-4 my-2 bg-surface-section rounded p-4 border border-surface-line">
    <FilterApp/>
    <UIDrawer
        :visible="true"
        :title="'Title'"
    />

  </div>

</template>

<style scoped>

</style>