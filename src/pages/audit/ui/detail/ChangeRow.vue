<script setup>
  /**
   * Hodisa ichidagi bitta yozuv o'zgarishi: tepada ikonka, yozuv nomi va holat
   * belgisi, ostida "Oldin / Keyin" kartochkalari yonma-yon. O'zgargan qatorlar
   * diff uslubida bo'yaladi: eskisida "−" qizil, yangisida "+" yashil.
   */
  import {
    Add16Regular,
    ArrowUndo16Regular,
    CheckmarkCircle16Filled,
    DismissCircle16Filled,
    Edit16Regular,
    Subtract16Regular
  } from '@vicons/fluent'
  import { UIStatus } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { isBool, isSignerChange, isUnknownCode, recordOf, valueText } from './auditValues.js'

  const props = defineProps({
    change: {
      type: Object,
      required: true
    },
    // Kartochkalar ochiq — modal sarlavhasidagi tugma barchasini birdan boshqaradi.
    open: Boolean
  })

  const { t } = i18n.global

  // UIStatus rang va ikonani `status.id` bo'yicha tanlaydi (UIStatus.vue: 10..13).
  const STATUS_ID = { create: 10, update: 11, delete: 12, restore: 13 }
  const ICON = {
    create: Add16Regular,
    update: Edit16Regular,
    delete: Subtract16Regular,
    restore: ArrowUndo16Regular
  }

  const status = computed(() => ({
    id: STATUS_ID[props.change.status] ?? 9,
    name: t(`audit.status.${props.change.status}`)
  }))

  const signer = computed(() => isSignerChange(props.change))
  const record = computed(() => recordOf(props.change, signer.value))
  const fields = computed(() => props.change.fields || [])

  // Ikkala kartochka bir xil chiziladi — farqi qaysi qiymat olinishida.
  const sides = computed(() => [
    { key: 'old', has: props.change.has_old, label: 'audit.detail.before', empty: 'audit.detail.noBefore' },
    { key: 'new', has: props.change.has_new, label: 'audit.detail.after', empty: 'audit.detail.noAfter' }
  ])

  const text = (f, value) => valueText(f, value, signer.value)
  const unknown = (f, value) => isUnknownCode(f, value, signer.value)
</script>

<template>
  <div class="change" :class="`change--${change.status}`">
    <div class="change__head">
      <span class="change__icon">
        <n-icon :size="14" :component="ICON[change.status] || Edit16Regular" />
      </span>
      <span class="change__title">
        <span class="change__name">{{ record.title }}</span>
        <span v-if="record.subtitle" class="change__sub">· {{ record.subtitle }}</span>
      </span>
      <UIStatus class="shrink-0" fig compact :tooltip="false" :status="status" />
    </div>

    <n-collapse-transition :show="open">
      <!-- O'ram padding bilan: kartochka yorliqlari ramkadan yuqoriga chiqadi. -->
      <div class="pair">
        <template v-for="s in sides" :key="s.key">
          <div v-if="s.has" class="card" :class="`card--${s.key}`">
            <span class="card__label">{{ $t(s.label) }}</span>
            <div
              v-for="f in fields"
              :key="`${s.key}-${f.field}`"
              class="row"
              :class="{ 'row--changed': f.changed }"
            >
              <span class="row__mark" aria-hidden="true"></span>
              <span class="row__label">{{ f.label }}</span>
              <span class="row__value">
                <n-icon
                  v-if="isBool(f, f[s.key])"
                  :size="14"
                  :class="f[s.key] ? 'bool--on' : 'bool--off'"
                  :component="f[s.key] ? CheckmarkCircle16Filled : DismissCircle16Filled"
                />
                <!-- Ma'nosi noma'lum kod: raqamning o'zi va izoh (backend so'rovi: docs/api/audit-enum-labels.md) -->
                <n-tooltip v-else-if="unknown(f, f[s.key])" trigger="hover">
                  <template #trigger>
                    <span class="row__unknown">{{ text(f, f[s.key]) }}</span>
                  </template>
                  {{ $t('audit.detail.unknownCode') }}
                </n-tooltip>
                <template v-else>{{ text(f, f[s.key]) }}</template>
              </span>
            </div>
          </div>
          <div v-else class="card card--empty">{{ $t(s.empty) }}</div>
        </template>
      </div>
    </n-collapse-transition>
  </div>
</template>

<style scoped>
  .change {
    padding: 7px 10px 8px;
    font-size: 12px;
    line-height: 1.4;
  }

  .change + .change {
    border-top: 1px solid var(--color-surface-line, #e2e8f0);
  }

  .change__head {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  /* Holat ikonkasi — rangli doira: qo'shildi yashil, o'chirildi qizil, tahrir ko'k. */
  .change__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 999px;
    background: var(--color-fig-blue-100, #d1e9ff);
    color: var(--color-fig-brand, #2e90fa);
  }

  .change--create .change__icon,
  .change--restore .change__icon {
    background: var(--color-fig-chip-green, #f5fdf6);
    color: var(--color-fig-chip-green-text, #008838);
  }

  .change--delete .change__icon {
    background: var(--color-fig-red-100, #ffe9e6);
    color: var(--color-fig-text-red, #ca1f29);
  }

  .change__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .change__name {
    font-weight: 500;
  }

  .change__sub {
    color: var(--color-fig-text-secondary, #475467);
  }

  /* ── "Oldin / Keyin" juftligi: mobilda ustma-ust, kengroqda yonma-yon ──── */
  .pair {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    padding-top: 14px;
  }

  @media (min-width: 640px) {
    .pair {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
  }

  .card {
    position: relative;
    padding: 10px 2px 3px;
    border: 1px solid var(--color-surface-line, #e2e8f0);
    border-radius: 10px;
    background: var(--color-surface-section, #ffffff);
  }

  /* "Oldin" / "Keyin" yorliqlari ramkani kesib o'tadi (fieldset legend uslubi). */
  .card__label {
    position: absolute;
    top: -9px;
    left: 12px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 10px;
    line-height: 16px;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    border: 1px solid var(--color-surface-line, #e2e8f0);
    background: var(--color-surface-section, #ffffff);
    color: var(--color-fig-text-red, #ca1f29);
  }

  .card--new .card__label {
    color: var(--color-fig-chip-green-text, #008838);
  }

  .card--empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 56px;
    border-style: dashed;
    background: transparent;
    color: var(--color-fig-text-tertiary, #98a2b3);
  }

  /*
    Uch ustun: MARKER | yorliq | qiymat. Marker ustuni barcha qatorlarda bor
    (o'zgarmaganida bo'sh) — yorliqlar bir chiziqda tekislanadi.
  */
  .row {
    display: grid;
    grid-template-columns: 12px minmax(0, 38%) minmax(0, 1fr);
    align-items: baseline;
    gap: 4px;
    padding: 1px 6px;
    border-radius: 5px;
    line-height: 1.35;
  }

  .row__mark {
    font-weight: 700;
    line-height: 1;
    text-align: center;
  }

  .row__label {
    color: var(--color-fig-text-secondary, #475467);
  }

  .row__value {
    word-break: break-word;
  }

  .row--changed {
    font-weight: 500;
  }

  /* Ma'nosi noma'lum kod — xira, nuqtali tagchiziq: ustiga borsa izoh chiqadi. */
  .row__unknown {
    cursor: help;
    color: var(--color-fig-text-tertiary, #98a2b3);
    text-decoration: underline dotted;
    text-underline-offset: 3px;
  }

  .card--old .row--changed {
    background: var(--color-fig-red-100, #ffe9e6);
  }

  .card--old .row--changed .row__mark::before {
    content: '−';
    color: var(--color-fig-text-red, #ca1f29);
  }

  .card--new .row--changed {
    background: var(--color-fig-chip-green, #f5fdf6);
  }

  .card--new .row--changed .row__mark::before {
    content: '+';
    color: var(--color-fig-chip-green-text, #008838);
  }

  .bool--on {
    color: var(--color-fig-chip-green-text, #008838);
  }

  .bool--off {
    color: var(--color-fig-text-red, #ca1f29);
  }
</style>
