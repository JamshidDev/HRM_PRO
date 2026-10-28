<script setup>
  // Lazy-chunk yuklanmaganda (yangi deploy / tarmoq) oq ekran o'rniga — xabar + qayta yuklash.
  const reload = () => {
    try {
      sessionStorage.removeItem('sc-chunk-reloaded')
    } catch {
      /* noop */
    }
    window.location.reload()
  }
</script>

<template>
  <div class="sc-chunk-err">
    <p class="sc-chunk-err__title">{{ $t('salaryControl.common.chunkError') }}</p>
    <button class="sc-chunk-err__btn" @click="reload">
      {{ $t('salaryControl.common.reload') }}
    </button>
  </div>
</template>

<style scoped>
  .sc-chunk-err {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px 16px;
    text-align: center;
  }
  .sc-chunk-err__title {
    font-size: 14px;
    color: var(--fig-text-secondary);
  }
  .sc-chunk-err__btn {
    border: 0;
    background: var(--fig-icon-brand);
    color: #fff;
    border-radius: 10px;
    padding: 8px 18px;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
</style>
