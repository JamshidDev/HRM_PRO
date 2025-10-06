<script setup>
// Skeleton component for WorkAnalyticCard
</script>

<template>
  <div class="w-full !h-full bg-surface-section px-3 py-2 rounded-lg border border-surface-line hover-effect-card">
    <div class="grid grid-cols-12 gap-2">
      <!-- Workdays skeleton -->
      <div class="col-span-12 flex items-center">
        <span class="text-nowrap text-secondary flex items-center gap-1">
          <n-skeleton circle size="small" class="mr-1" />
          <n-skeleton text width="40%" height="0.875rem" />
        </span>
        <n-divider dashed class="mx-2 !my-4" />
        <n-skeleton text width="25%" height="1.5rem" />
      </div>

      <!-- All minutes skeleton -->
      <div class="col-span-12 flex items-center">
        <span class="text-nowrap text-secondary flex items-center gap-1">
          <n-skeleton circle size="small" class="mr-1" />
          <n-skeleton text width="45%" height="0.875rem" />
        </span>
        <n-divider dashed class="mx-2 !my-4" />
        <n-skeleton text width="30%" height="1.5rem" />
      </div>

      <!-- Deficit skeleton -->
      <div class="col-span-12 flex items-center">
        <span class="text-nowrap text-secondary flex items-center gap-1">
          <n-skeleton circle size="small" class="mr-1" />
          <n-skeleton text width="35%" height="0.875rem" />
        </span>
        <n-divider dashed class="mx-2 !my-4" />
        <n-skeleton text width="25%" height="1.5rem" />
      </div>

      <div class="col-span-12 mt-4"></div>

      <!-- Max workers skeleton -->
      <div class="col-span-6 border bg-success/4 border-success border-dashed p-2 rounded-lg flex flex-col">
        <div class="flex justify-center mb-2">
          <div class="flex -space-x-2">
            <n-skeleton v-for="n in 4" :key="n" circle size="small" class="border-2 border-white" />
          </div>
        </div>
        <n-skeleton text width="80%" height="0.75rem" class="mx-auto" />
      </div>

      <!-- Min workers skeleton -->
      <div class="col-span-6 border border-danger bg-danger/4 border-dashed p-2 rounded-lg flex flex-col">
        <div class="flex justify-center mb-2">
          <div class="flex -space-x-2">
            <n-skeleton v-for="n in 4" :key="n" circle size="small" class="border-2 border-white" />
          </div>
        </div>
        <n-skeleton text width="80%" height="0.75rem" class="mx-auto" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional skeleton styling if needed */
</style>