<script setup>
  // Link muddati tugaganda imzolash bloki o'rnida turadi: nima bo'lgani va nima qilish kerakligi.
  // Hujjat ochiq qoladi — uni o'qish mumkin, faqat imzolab bo'lmaydi.
  import { Timer24Regular } from '@vicons/fluent'
</script>

<template>
  <div
    id="draw-signature"
    class="sign-card flex w-full scroll-mt-24 flex-col items-center px-6 py-10 text-center"
  >
    <span class="expired-icon">
      <n-icon size="36"><Timer24Regular /></n-icon>
    </span>
    <h3 class="mt-4 text-xl font-semibold text-textColor0">
      {{ $t('signature.linkExpiredTitle') }}
    </h3>
    <p class="mt-1.5 max-w-[300px] text-sm text-textColor2">
      {{ $t('signature.linkExpiredHint') }}
    </p>
  </div>
</template>

<style scoped>
  .expired-icon {
    display: flex;
    width: 76px;
    height: 76px;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    color: var(--fig-chip-amber-text);
    background: var(--fig-chip-amber-bg);
    box-shadow: 0 0 0 10px color-mix(in srgb, var(--fig-chip-amber-bg) 50%, transparent);
  }
</style>
