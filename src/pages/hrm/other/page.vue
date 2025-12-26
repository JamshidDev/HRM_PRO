<script setup>
  // HRM Other Page
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-textColor">{{ $t('hrm.other.title') }}</h1>
      <p class="text-textColor2 mt-2">{{ $t('hrm.other.description') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Content placeholder -->
      <div class="bg-surface-section p-6 rounded-lg border border-surface-line">
        <h3 class="text-lg font-semibold mb-3">{{ $t('hrm.other.section1') }}</h3>
        <p class="text-textColor2">{{ $t('hrm.other.section1_desc') }}</p>
      </div>

      <div class="bg-surface-section p-6 rounded-lg border border-surface-line">
        <h3 class="text-lg font-semibold mb-3">{{ $t('hrm.other.section2') }}</h3>
        <p class="text-textColor2">{{ $t('hrm.other.section2_desc') }}</p>
      </div>

      <div class="bg-surface-section p-6 rounded-lg border border-surface-line">
        <h3 class="text-lg font-semibold mb-3">{{ $t('hrm.other.section3') }}</h3>
        <p class="text-textColor2">{{ $t('hrm.other.section3_desc') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* HRM Other page specific styles */
</style>
