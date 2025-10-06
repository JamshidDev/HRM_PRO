<script setup>
// Props skeleton komponent uchun
const props = defineProps({
  count: {
    type: Number,
    default: 1
  }
})
</script>

<template>
  <div 
    v-for="index in count" 
    :key="index"
    class="w-full h-full hover-effect-card bg-surface-section px-4 py-2 rounded-lg border border-surface-line"
  >
    <div class="flex justify-between items-start">
      <!-- Icon skeleton -->
      <n-skeleton 
        width="40px" 
        height="40px" 
        :sharp="false"
        class="rounded-lg"
      />
      <!-- Badge skeleton -->
      <n-skeleton 
        width="60px" 
        height="24px" 
        :sharp="false"
        class="rounded-lg"
      />
    </div>
    
    <!-- Count skeleton -->
    <div class="!mt-4">
      <n-skeleton 
        width="80px" 
        height="28px" 
        :sharp="false"
      />
    </div>
    
    <!-- Description skeleton -->
    <div class="!mt-2">
      <n-skeleton 
        width="120px" 
        height="16px" 
        :sharp="false"
      />
    </div>
  </div>
</template>

<style scoped>
/* Skeleton komponent uchun qo'shimcha stilllar kerak bo'lsa */
</style>