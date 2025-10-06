<script setup>
// Skeleton component for TopDevices
</script>

<template>
  <div class="w-full !h-full bg-surface-section px-3 py-2 rounded-lg border border-surface-line hover-effect-card">
    <div class="grid grid-cols-12">
      <!-- Header skeleton -->
      <div class="col-span-12 flex items-center">
        <n-skeleton text :repeat="1" width="60%" height="1rem" class="mr-2" />
        <n-divider dashed class="mx-2 !my-4" />
        <n-skeleton text :repeat="1" width="20%" height="1rem" />
      </div>
      
      <!-- Device list skeleton -->
      <template v-for="n in 2" :key="n">
        <div class="col-span-12 flex gap-2 bg-dark/3 mb-1 rounded-lg px-2 border-b border-b-surface-line">
          <div class="flex justify-between w-full py-2">
            <n-skeleton text :repeat="1" width="65%" height="0.875rem" />
            <n-skeleton text :repeat="1" width="25%" height="0.75rem" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Additional skeleton animations if needed */
</style>