<script setup>
  import { Info20Regular } from '@vicons/fluent'

  // Ro'yxat mazmuni operator uchun o'z-o'zidan ravshan emas — uch xil holat
  // bitta jadvalda ko'rinadi, shuning uchun qisqacha izoh beriladi.
  const reasons = [
    { key: 'noCode', tone: 'tone--warn' },
    { key: 'foreignCode', tone: 'tone--warn' },
    { key: 'removed', tone: 'tone--danger' }
  ]
</script>

<template>
  <div class="device-info">
    <div class="device-info__head">
      <n-icon size="18" class="shrink-0 text-info"><Info20Regular /></n-icon>
      <p class="text-sm font-medium">{{ $t('deviceEvent.info.title') }}</p>
    </div>
    <p class="device-info__text">{{ $t('deviceEvent.info.desc') }}</p>
    <!-- Amal yo'riqnomasi: o'chirish AYNAN qurilmadan bajariladi. -->
    <p class="device-info__action">{{ $t('deviceEvent.info.action') }}</p>
    <div class="device-info__reasons">
      <div v-for="r in reasons" :key="r.key" class="device-info__reason">
        <span class="device-info__dot" :class="r.tone"></span>
        <span>
          <b>{{ $t(`deviceEvent.reason.${r.key}`) }}</b>
          — {{ $t(`deviceEvent.info.${r.key}`) }}
        </span>
      </div>
    </div>
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

  .device-info__reasons {
    display: grid;
    gap: 4px;
    grid-template-columns: 1fr;
  }
  @media (width >= 1024px) {
    .device-info__action {
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid rgb(234 179 8 / 35%);
    background: rgb(234 179 8 / 10%);
    font-size: 12px;
    line-height: 17px;
    color: rgb(146 90 6);
  }

  .device-info__reasons {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }
  }
  .device-info__reason {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 12px;
    line-height: 17px;
    color: var(--text-color-2);
  }
  .device-info__dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    flex-shrink: 0;
    transform: translateY(-1px);
  }
  .tone--warn {
    background: rgb(234 179 8);
  }
  .tone--danger {
    background: rgb(239 68 68);
  }
</style>
