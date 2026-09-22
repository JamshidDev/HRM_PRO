<script setup>
  import { ErrorCircle20Filled } from '@vicons/fluent'
</script>

<template>
  <!-- Ro'yxat mazmuni operator uchun ravshan emas: kimlar va nima qilish kerak. -->
  <div class="device-info">
    <n-icon size="18" class="device-info__icon"><ErrorCircle20Filled /></n-icon>
    <p class="device-info__text">
      <b>{{ $t('deviceEvent.info.title') }}</b>
      {{ $t('deviceEvent.info.desc') }}
    </p>
  </div>
</template>

<style scoped>
  /* Ogohlantirish (alert) ko'rinishi — sariq fon va chegara. */
  .device-info {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    padding: 10px 14px;
    border: 1px solid rgb(234 179 8 / 45%);
    border-radius: 12px;
    background: rgb(234 179 8 / 12%);
  }
  .device-info__icon {
    flex-shrink: 0;
    margin-top: 1px;
    color: rgb(202 138 4);
  }
  .device-info__text {
    font-size: 12px;
    line-height: 18px;
    color: rgb(133 77 14);
  }
  .device-info__text b {
    color: rgb(113 63 18);
    margin-right: 4px;
  }

  /* Tungi rejimda sariq fon to'q bo'ladi — matn ochroq rangda. */
  :global(html.dark) .device-info,
  :global([data-theme='dark']) .device-info {
    background: rgb(234 179 8 / 16%);
    border-color: rgb(234 179 8 / 40%);
  }
  :global(html.dark) .device-info__text,
  :global([data-theme='dark']) .device-info__text {
    color: rgb(250 204 21);
  }
  :global(html.dark) .device-info__text b,
  :global([data-theme='dark']) .device-info__text b {
    color: rgb(253 224 71);
  }
  :global(html.dark) .device-info__icon,
  :global([data-theme='dark']) .device-info__icon {
    color: rgb(250 204 21);
  }
</style>
