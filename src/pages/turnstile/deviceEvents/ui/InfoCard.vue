<script setup>
  import { Info20Regular } from '@vicons/fluent'
</script>

<template>
  <!-- Ro'yxat mazmuni operator uchun ravshan emas: kimlar va nima qilish kerak. -->
  <div class="device-info">
    <n-icon size="18" class="device-info__icon"><Info20Regular /></n-icon>
    <p class="device-info__text">
      <b>{{ $t('deviceEvent.info.title') }}</b>
      {{ $t('deviceEvent.info.desc') }}
    </p>
  </div>
</template>

<style scoped>
  .device-info {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--surface-line);
    border-radius: 12px;
    background: var(--surface-card);
  }
  .device-info__icon {
    flex-shrink: 0;
    margin-top: 1px;
    color: var(--info-color, #2080f0);
  }
  .device-info__text {
    font-size: 12px;
    line-height: 18px;
    color: var(--text-color-2);
  }
  .device-info__text b {
    color: var(--text-color-1);
    margin-right: 4px;
  }
</style>
