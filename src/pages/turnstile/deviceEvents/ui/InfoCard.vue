<script setup>
  import { Info20Regular } from '@vicons/fluent'
</script>

<template>
  <!-- Ro'yxat mazmuni operator uchun o'z-o'zidan ravshan emas — qisqa izoh
       va amal yo'riqnomasi beriladi. -->
  <div class="device-info">
    <div class="device-info__head">
      <n-icon size="18" class="shrink-0 text-info"><Info20Regular /></n-icon>
      <p class="text-sm font-medium">{{ $t('deviceEvent.info.title') }}</p>
    </div>
    <p class="device-info__text">{{ $t('deviceEvent.info.desc') }}</p>
    <!-- O'chirish AYNAN qurilmadan bajariladi, HRM tomondan emas. -->
    <p class="device-info__action">{{ $t('deviceEvent.info.action') }}</p>
  </div>
</template>

<style scoped>
  .device-info {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 14px;
    border: 1px solid var(--surface-line);
    border-radius: 12px;
    background: var(--surface-card);
  }
  .device-info__head {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .device-info__text {
    font-size: 12px;
    line-height: 17px;
    color: var(--text-color-2);
  }
  .device-info__action {
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid rgb(234 179 8 / 35%);
    background: rgb(234 179 8 / 10%);
    font-size: 12px;
    line-height: 17px;
    color: rgb(146 90 6);
  }
</style>
