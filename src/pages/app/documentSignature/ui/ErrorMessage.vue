<script setup>
  import { usePdfViewerStore } from '@/store/modules/index.js'

  const store = usePdfViewerStore()
</script>

<template>
  <div class="w-full max-w-[1440px] mx-auto px-2 mt-16">
    <div
      class="max-w-[600px] mx-auto bg-danger/10 border border-danger/30 text-danger p-4 text-center text-lg rounded-md"
    >
      {{ store.errorMessage }}
    </div>
  </div>
</template>
