<script setup>

</script>

<template>
  <div class="w-[280px] border border-surface-line rounded-xl
  flex flex-col px-2 py-3
">
    <template v-for="item in 4" :key="item">
      <div
          class="w-full px-4 py-2 bg-blue-300 mb-2 rounded-sm"
      >Notification</div>
    </template>
  </div>
</template>

<style scoped>

</style>