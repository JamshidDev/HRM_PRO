<script setup>
  // Umumiy «bo'sh holat» — ma'lumot yo'q bo'lganда markazlashgan xabar + ixtiyoriy CTA.
  defineProps({
    text: { type: String, default: '' },
    // ixtiyoriy harakat tugmasi (masalan «Hisobot yuklash»ga o'tish)
    ctaLabel: { type: String, default: '' }
  })
  defineEmits(['cta'])
</script>

<template>
  <div class="sc-empty">
    <p class="sc-empty-text">{{ text }}</p>
    <n-button v-if="ctaLabel" size="small" type="primary" secondary @click="$emit('cta')">
      {{ ctaLabel }}
    </n-button>
  </div>
</template>

<style scoped>
  .sc-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 56px 24px;
    text-align: center;
    background: var(--fig-block-bg);
    border: 0.8px dashed var(--fig-blue-300);
    border-radius: 16px;
  }
  .sc-empty-text {
    font-size: 14px;
    line-height: 1.5;
    color: var(--fig-text-tertiary);
    max-width: 420px;
  }
</style>
