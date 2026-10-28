<script setup>
  // Oylik nazorati bo'limlari uchun yagona skeleton loader — `n-spin` o'rniga
  // kontent shaklidagi placeholder (app idiomi: n-skeleton :sharp="false").
  // Yuklanayotganda bo'sh kontent + spinner emas, mos shakldagi joy ko'rsatiladi.
  defineProps({
    // kpi | cards | chart | chart2 | table
    variant: { type: String, default: 'chart' },
    count: { type: Number, default: 4 },
    chartHeight: { type: String, default: '320px' }
  })
</script>

<template>
  <!-- KPI / summary kartalar qatori -->
  <div v-if="variant === 'kpi'" class="sk-grid-kpi">
    <div v-for="i in count" :key="i" class="sk-card">
      <div class="sk-row">
        <n-skeleton width="28px" height="28px" :sharp="false" class="sk-r8" />
        <n-skeleton width="104px" height="20px" :sharp="false" class="sk-r999" />
      </div>
      <n-skeleton width="70%" height="24px" :sharp="false" class="sk-r8 sk-mt4" />
      <n-skeleton width="42%" height="13px" :sharp="false" class="sk-r8" />
    </div>
  </div>

  <!-- Kontent kartalar to'ri (risk kartalari) -->
  <div v-else-if="variant === 'cards'" class="sk-grid-cards">
    <div v-for="i in count" :key="i" class="sk-card">
      <div class="sk-row">
        <n-skeleton width="24px" height="24px" :sharp="false" class="sk-r8" />
        <n-skeleton width="58%" height="16px" :sharp="false" class="sk-r8" />
      </div>
      <n-skeleton width="100%" height="42px" :sharp="false" class="sk-r10 sk-mt8" />
      <n-skeleton width="82%" height="12px" :sharp="false" class="sk-r8 sk-mt8" />
    </div>
  </div>

  <!-- Ikki grafik yonma-yon -->
  <div v-else-if="variant === 'chart2'" class="sk-grid-2">
    <div v-for="i in 2" :key="i" class="sk-card">
      <n-skeleton width="190px" height="15px" :sharp="false" class="sk-r8" />
      <n-skeleton width="250px" height="12px" :sharp="false" class="sk-r8 sk-mt6" />
      <n-skeleton :height="chartHeight" :sharp="false" class="sk-r12 sk-mt12" />
    </div>
  </div>

  <!-- Jadval kartasi -->
  <div v-else-if="variant === 'table'" class="sk-card">
    <n-skeleton width="170px" height="15px" :sharp="false" class="sk-r8" />
    <n-skeleton width="250px" height="12px" :sharp="false" class="sk-r8 sk-mt6" />
    <div class="sk-mt12">
      <n-skeleton v-for="i in 7" :key="i" height="40px" :sharp="false" class="sk-r10 sk-rowgap" />
    </div>
  </div>

  <!-- Bitta grafik (default) -->
  <div v-else class="sk-card">
    <n-skeleton width="190px" height="15px" :sharp="false" class="sk-r8" />
    <n-skeleton width="250px" height="12px" :sharp="false" class="sk-r8 sk-mt6" />
    <n-skeleton :height="chartHeight" :sharp="false" class="sk-r12 sk-mt12" />
  </div>
</template>

<style scoped>
  /* Karta qobig'i — haqiqiy kartalar bilan bir xil (fig token, radius 16px). */
  .sk-card {
    background: var(--fig-block-bg);
    border: 0.8px solid var(--fig-blue-300);
    border-radius: 16px;
    padding: 14px 16px 16px;
  }
  .sk-grid-kpi {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }
  .sk-grid-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 12px;
  }
  .sk-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 900px) {
    .sk-grid-2 {
      grid-template-columns: 1fr;
    }
  }
  .sk-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sk-rowgap {
    margin-bottom: 8px;
  }
  .sk-mt4 {
    margin-top: 4px;
  }
  .sk-mt6 {
    margin-top: 6px;
  }
  .sk-mt8 {
    margin-top: 8px;
  }
  .sk-mt12 {
    margin-top: 12px;
  }
  /* Radius variantlari (n-skeleton :sharp=false ni token radiuslarga keltiradi). */
  .sk-r8 :deep(.n-skeleton),
  .sk-r8.n-skeleton {
    border-radius: 8px;
  }
  .sk-r10 :deep(.n-skeleton),
  .sk-r10.n-skeleton {
    border-radius: 10px;
  }
  .sk-r12 :deep(.n-skeleton),
  .sk-r12.n-skeleton {
    border-radius: 12px;
  }
  .sk-r999 :deep(.n-skeleton),
  .sk-r999.n-skeleton {
    border-radius: 999px;
  }
</style>
