<script setup>
  // Havola ochilmadi (noto'g'ri / muddati o'tgan / hujjat yopilgan) — hujjat ko'rsatilmaydi, faqat sababi.
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import { LinkDismiss24Regular } from '@vicons/fluent'

  const store = usePdfViewerStore()
</script>

<template>
  <div class="mx-auto mt-10 w-full max-w-[480px] px-4 sm:mt-16">
    <div class="error-card flex flex-col items-center px-6 py-12 text-center">
      <span class="error-icon">
        <n-icon size="36"><LinkDismiss24Regular /></n-icon>
      </span>
      <h3 class="mt-4 text-xl font-semibold text-textColor0">
        {{ $t('signature.linkErrorTitle') }}
      </h3>
      <p class="mt-1.5 text-sm text-textColor2">{{ store.errorMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
  .error-card {
    border: 1px solid var(--color-surface-line);
    border-radius: 20px;
    background: var(--color-surface-section);
    box-shadow:
      0 1px 2px rgb(16 24 40 / 4%),
      0 12px 32px -12px rgb(16 24 40 / 18%);
  }
  .error-icon {
    display: flex;
    width: 76px;
    height: 76px;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    color: var(--color-danger);
    background: color-mix(in srgb, var(--color-danger) 12%, transparent);
    box-shadow: 0 0 0 10px color-mix(in srgb, var(--color-danger) 6%, transparent);
  }
</style>
