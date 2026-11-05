<script setup>
  // Umumiy «bo'sh holat» — ma'lumot yo'q bo'lganda markazlashgan ikonka + xabar + CTA.
  import { BuildingMultiple24Regular } from '@vicons/fluent'
  defineProps({
    text: { type: String, default: '' },
    // ixtiyoriy harakat tugmasi (masalan «Tashkilot tanlash» — filtr panelini ochadi)
    ctaLabel: { type: String, default: '' }
  })
  defineEmits(['cta'])
</script>

<template>
  <div class="sc-empty">
    <div class="sc-empty-ic">
      <n-icon :size="28"><BuildingMultiple24Regular /></n-icon>
    </div>
    <p class="sc-empty-text">{{ text }}</p>
    <n-button v-if="ctaLabel" size="medium" type="primary" @click="$emit('cta')">
      {{ ctaLabel }}
    </n-button>
  </div>
</template>

<style scoped>
  .sc-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 56px 24px;
    text-align: center;
    background: var(--fig-block-bg);
    border: 0.8px dashed var(--fig-blue-300);
    border-radius: 16px;
  }
  .sc-empty-ic {
    display: inline-grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: var(--color-brand-surface);
    color: var(--primary-color);
  }
  .sc-empty-text {
    font-size: 14px;
    line-height: 1.5;
    color: var(--fig-text-secondary);
    max-width: 420px;
  }
</style>
