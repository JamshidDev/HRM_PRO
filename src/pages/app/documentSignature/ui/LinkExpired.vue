<script setup>
  // Link muddati tugaganda imzolash bloki o'rnida turadi: nima bo'lgani va nima qilish kerakligi.
  // Hujjat ochiq qoladi — uni o'qish mumkin, faqat imzolab bo'lmaydi.
  import { Timer24Regular } from '@vicons/fluent'
</script>

<template>
  <div id="draw-signature" class="w-full max-w-[800px] mx-auto px-4 pt-10 mb-[160px]">
    <div
      class="flex flex-col items-center text-center rounded-xl border border-dashed border-surface-line bg-surface-section px-6 py-8"
    >
      <span class="flex items-center justify-center size-12 rounded-full bg-danger/10 text-danger">
        <n-icon size="26"><Timer24Regular /></n-icon>
      </span>
      <h3 class="mt-3 text-lg font-semibold text-textColor1">
        {{ $t('signature.linkExpiredTitle') }}
      </h3>
      <p class="mt-1 text-sm text-textColor3">{{ $t('signature.linkExpiredHint') }}</p>
    </div>
  </div>
</template>
