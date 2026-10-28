<script setup>
  // Oylik nazorati bo'limlari uchun sarlavhali karta wrapper (fig tema tokenlari).
  defineProps({
    title: { type: String, default: '' },
    sub: { type: String, default: '' }
  })
</script>

<template>
  <div class="sc-card">
    <div v-if="title || $slots.head" class="sc-card__head">
      <div>
        <h2 v-if="title" class="sc-card__title">{{ title }}</h2>
        <p v-if="sub" class="sc-card__sub">{{ sub }}</p>
      </div>
      <slot name="head" />
    </div>
    <slot />
  </div>
</template>

<style scoped>
  .sc-card {
    background: var(--fig-block-bg);
    border: 0.8px solid var(--fig-blue-300);
    border-radius: 16px;
    padding: 14px 16px 16px;
    margin-bottom: 16px;
    overflow: hidden;
  }
  .sc-card__head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }
  .sc-card__title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--fig-text-primary);
  }
  .sc-card__sub {
    margin: 2px 0 0;
    font-size: 12.5px;
    line-height: 1.4;
    color: var(--fig-text-tertiary);
  }
</style>
