<script setup>
  /**
   * Bo'limlar va Xodimlar jadvalidagi «Joylashuvlar» katakchasi — faqat ko'rsatadi, bosilmaydi
   * (ochish / qo'shish — qatordagi amallar menyusida).
   *
   * - joy bor → ko'k chip («3 ta joylashuv» yoki son noma'lum bo'lsa «Belgilangan»);
   * - joy yo'q → kulrang chip «Belgilanmagan»;
   * - erkin rejim → yashil «Erkin» chipi qo'shimcha.
   */
  import { Location16Regular, SubtractCircle16Regular } from '@vicons/fluent'

  const props = defineProps({
    // Joylar soni; backend bermasa — null (shunda `has` ga qaraladi).
    count: { type: Number, default: null },
    has: { type: Boolean, default: false },
    free: { type: Boolean, default: false }
  })

  const hasLocation = computed(() => (props.count !== null ? props.count > 0 : props.has))
</script>

<template>
  <div class="flex min-w-0 items-center gap-1.5">
    <span v-if="hasLocation" class="dl-chip bg-fig-chip-brand text-fig-chip-brand-text">
      <n-icon size="14" class="shrink-0"><Location16Regular /></n-icon>
      <span class="truncate">
        {{
          count !== null
            ? $t('departmentLocationPage.locationCount', { n: count })
            : $t('departmentLocationPage.locationExistsShort')
        }}
      </span>
    </span>
    <!-- Kulrang — neytral holat (ogohlantirish emas) -->
    <span v-else class="dl-chip bg-fig-bg-disable text-fig-text-tertiary">
      <n-icon size="14" class="shrink-0"><SubtractCircle16Regular /></n-icon>
      <span class="truncate">{{ $t('departmentLocationPage.noLocation') }}</span>
    </span>
    <span v-if="free" class="dl-chip bg-fig-chip-green text-fig-chip-green-text">
      {{ $t('departmentLocationPage.freeBadge') }}
    </span>
  </div>
</template>

<style scoped>
  .dl-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    height: 24px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    line-height: 16px;
    font-weight: 500;
    white-space: nowrap;
  }
</style>
