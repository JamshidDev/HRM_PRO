<script setup>
  // Umumiy «xato holati» — API yiqilganда xabar + «Qayta urinish» tugmasi.
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  defineProps({
    text: { type: String, default: '' }
  })
  defineEmits(['retry'])
</script>

<template>
  <div class="sc-error">
    <svg class="sc-error-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 2 20h20L12 3zM12 10v4M12 17h.01" />
    </svg>
    <p class="sc-error-text">{{ text || t('content.error') }}</p>
    <n-button size="small" type="error" secondary @click="$emit('retry')">
      {{ t('content.retry') }}
    </n-button>
  </div>
</template>

<style scoped>
  .sc-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 48px 24px;
    text-align: center;
    background: var(--fig-block-bg);
    border: 0.8px solid var(--fig-red-100);
    border-radius: 16px;
  }
  .sc-error-icon {
    width: 32px;
    height: 32px;
    fill: none;
    stroke: var(--fig-icon-red);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .sc-error-text {
    font-size: 14px;
    line-height: 1.5;
    color: var(--fig-text-secondary);
    max-width: 420px;
  }
</style>
