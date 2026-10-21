<script setup>
  // Umumiy status badge — risk/holat statusini ikon + nuqta + matn bilan ko'rsatadi
  // (faqat rangga tayanmaydi — a11y). Ranglar fig-* tokenlardan (dark/light avto).
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const props = defineProps({
    // backend risk status: bad | chk | ok | na (META'dan tone+matn olinadi)
    status: { type: String, default: '' },
    // YOKI to'g'ridan-to'g'ri tone + label (severity/result kabi boshqa lug'atlar uchun):
    // tone: red | amber | green | indigo | orange
    tone: { type: String, default: '' },
    label: { type: String, default: '' },
    // matnni yashirish (faqat nuqta) kerak bo'lsa
    labelHidden: { type: Boolean, default: false }
  })

  const META = {
    bad: { tone: 'red', label: 'salaryControl.risk.status.bad' },
    chk: { tone: 'amber', label: 'salaryControl.risk.status.chk' },
    ok: { tone: 'green', label: 'salaryControl.risk.status.ok' },
    na: { tone: 'indigo', label: 'salaryControl.risk.status.na' }
  }

  // tone/label to'g'ridan-to'g'ri berilsa — o'shani, aks holda status META'sidan.
  const tone = computed(() => props.tone || META[props.status]?.tone || 'indigo')
  const label = computed(() =>
    props.label || t(META[props.status]?.label ?? 'salaryControl.risk.status.na')
  )
</script>

<template>
  <span class="sc-badge" :class="`sc-badge--${tone}`">
    <i class="sc-dot" aria-hidden="true"></i>
    <span v-if="!labelHidden">{{ label }}</span>
  </span>
</template>

<style scoped>
  .sc-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }
  .sc-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    display: inline-block;
  }
  .sc-badge--red {
    background: var(--fig-red-100);
    color: var(--fig-text-red);
  }
  .sc-badge--amber {
    background: var(--fig-chip-amber-bg);
    color: var(--fig-chip-amber-text);
  }
  .sc-badge--orange {
    background: var(--fig-chip-amber-bg);
    color: var(--fig-icon-orange);
  }
  .sc-badge--green {
    background: var(--fig-chip-green-bg);
    color: var(--fig-chip-green-text);
  }
  .sc-badge--indigo {
    background: var(--fig-chip-indigo-bg);
    color: var(--fig-chip-indigo-text);
  }
</style>
