<script setup>
  /*
   * Belgilangan kataklarga nima yozilishi: tez tur chiplari, «Boshqa tur»,
   * soat, ixtiyoriy 2-tur, natija namunasi va «Tozalash».
   * Tanlangan harf — «cho'tka»: keyin bosilgan / belgilangan kataklarga yoziladi.
   * Kataklar oldin belgilangan bo'lsa — harf bosilishi bilan darhol yoziladi.
   * «Tozalash» ham cho'tka (o'chirg'ich). Har tanlovda `pick` chiqadi.
   *
   * Ikki joyda ishlatiladi (`Timesheet.vue`): suzuvchi tanlov paneli (C) va
   * panjara ustidagi asboblar qatori (A). Tanlangan tur `store.payload` da —
   * ikkala joy bitta qiymatni ko'radi.
   */
  import { Add20Filled, Eraser20Filled, Subtract20Regular } from '@vicons/fluent'
  import { h } from 'vue'
  import { useComponentStore, useTimesheetWorkerStore } from '@/store/modules/index.js'
  import { colorOfDetail } from './timesheetGrid.js'
  import { quickTypeIds } from './quickTypes.js'

  defineProps({
    // Tanlov bor — «Tozalash» faol.
    hasSelection: { type: Boolean, default: false },
    previewDetails: { type: Array, default: () => [] }
  })
  const emit = defineEmits(['pick'])

  const store = useTimesheetWorkerStore()
  const compStore = useComponentStore()

  const typeByIdOrNull = (id) =>
    id == null ? null : (compStore.timesheetTypes?.find((v) => v.id === id) ?? null)

  // Tez-tez ishlatiladigan turlar — standart to'plam yoki foydalanuvchi «Ma'lumot» oynasida tanlagani.
  const DEFAULT_HOURS = 8
  const quickTypes = computed(() => quickTypeIds.value.map(typeByIdOrNull).filter(Boolean))

  // Faol harfni qayta bosish (tanlov yo'q paytda) — cho'tkani o'chiradi.
  const onChip = (type, hasSelection) => {
    if (!hasSelection && !store.payload.isClearing && store.payload.status === type.id) {
      store.payload.status = null
      return
    }
    setMainType(type)
  }
  const toggleEraser = () => {
    store.payload.isClearing = !store.payload.isClearing
    if (store.payload.isClearing) emit('pick')
  }

  // Namuna katagi — o'chirg'ichdan oldingi harfga qaytaradi (qaytadan tanlash shart emas).
  const brushActive = computed(() => !store.payload.isClearing && Boolean(store.payload.status))
  const onSample = () => {
    if (!store.payload.isClearing || !store.payload.status) return
    store.payload.isClearing = false
    emit('pick')
  }
  // Soat o'zgarsa — o'chirg'ich o'chadi, harf cho'tkasi qaytadi.
  const onHours = () => {
    store.payload.isClearing = false
    emit('pick')
  }

  const setMainType = (type) => {
    store.payload.isClearing = false
    store.payload.status = type?.id ?? null
    if (!type?.hours) store.payload.hours = null
    else if (store.payload.hours == null) store.payload.hours = DEFAULT_HOURS
    emit('pick')
  }
  const setExtraType = (type) => {
    store.payload.status2 = type?.id ?? null
    if (!type?.hours) store.payload.hours2 = null
    else if (store.payload.hours2 == null) store.payload.hours2 = DEFAULT_HOURS
    emit('pick')
  }
  // Ikkinchi juftlik ixtiyoriy (katakda ikki kod: masalan «K/T 6/2»).
  const extraOpen = ref(Boolean(store.payload.status2))
  const toggleExtra = () => {
    extraOpen.value = !extraOpen.value
    if (!extraOpen.value) setExtraType(null)
  }

  const renderLabel = (option) => [
    h('div', { class: 'font-medium text-gray-500 whitespace-nowrap' }, `${option.name} (${option.key})`)
  ]

  const partsOf = (details, field) =>
    (details ?? [])
      .filter((d) => d?.[field] !== null && d?.[field] !== undefined)
      .map((d) => ({ value: d[field], color: colorOfDetail(d) }))
</script>

<template>
  <div class="fc">
    <div class="fc-types">
      <n-tooltip v-for="type in quickTypes" :key="type.id" :delay="300">
        <template #trigger>
          <button
            :class="{ 'is-active': !store.payload.isClearing && store.payload.status === type.id }"
            :style="{ color: colorOfDetail({ status_id: type.id }) }"
            class="fc-chip"
            type="button"
            @click="onChip(type, hasSelection)"
          >
            {{ type.key }}
          </button>
        </template>
        {{ type.name }}
      </n-tooltip>
      <!-- Tur + soat — bitta quti: «Boshqa tur | 8 soat − +» -->
      <div class="fc-pair">
        <n-select
          :bordered="false"
          :consistent-menu-width="false"
          :loading="compStore.timesheetEnumsLoading"
          :options="compStore.timesheetTypes"
          :placeholder="$t('timesheetPage.otherType')"
          :render-label="renderLabel"
          :value="store.payload.status"
          class="fc-select"
          filterable
          label-field="name"
          value-field="id"
          @update:value="(_, type) => setMainType(type)"
        />
        <span class="fc-pair-sep" />
        <n-input-number
          v-model:value="store.payload.hours"
          :bordered="false"
          :disabled="!typeByIdOrNull(store.payload.status)?.hours"
          :max="24"
          :min="0"
          :precision="0"
          class="fc-hours-input"
          placeholder=""
          @update:value="onHours"
        >
          <template #suffix>
            <span class="fc-hours-unit">{{ $t('timesheetPage.hoursShort') }}</span>
          </template>
        </n-input-number>
      </div>
    </div>

    <!-- Ikkinchi juftlik — kerak bo'lganda «+» tugmasidan chapdan o'ngga ochiladi. -->
    <Transition name="fc-extra">
      <div v-if="extraOpen" class="fc-extra">
        <span class="fc-plus">+</span>
        <div class="fc-pair">
          <n-select
            :bordered="false"
            :consistent-menu-width="false"
            :disabled="!store.payload.status"
            :options="compStore.timesheetTypes"
            :placeholder="$t('timesheetPage.extraType')"
            :render-label="renderLabel"
            :value="store.payload.status2"
            class="fc-select"
            filterable
            label-field="name"
            value-field="id"
            @update:value="(_, type) => setExtraType(type)"
          />
          <span class="fc-pair-sep" />
          <n-input-number
            v-model:value="store.payload.hours2"
            :bordered="false"
            :disabled="!typeByIdOrNull(store.payload.status2)?.hours"
            :max="24"
            :min="0"
            :precision="0"
            class="fc-hours-input"
            placeholder=""
            @update:value="onHours"
          >
            <template #suffix>
              <span class="fc-hours-unit">{{ $t('timesheetPage.hoursShort') }}</span>
            </template>
          </n-input-number>
        </div>
      </div>
    </Transition>
    <n-tooltip :delay="300">
      <template #trigger>
        <n-button
          :type="extraOpen ? 'error' : 'success'"
          secondary
          circle
          @click="toggleExtra"
        >
          <template #icon>
            <n-icon :component="extraOpen ? Subtract20Regular : Add20Filled" />
          </template>
        </n-button>
      </template>
      {{ extraOpen ? $t('timesheetPage.removeExtra') : $t('timesheetPage.addExtra') }}
    </n-tooltip>

    <span class="fc-divider" />

    <!-- Katakka aynan nima yoziladi — panjaradagi ko'rinishda. -->
    <!-- Faol cho'tka — halqa bilan; o'chirg'ich yoqilganda bosib harfga qaytiladi. -->
    <button
      :class="{
        'is-active': brushActive,
        'is-dim': store.payload.isClearing,
        'is-hours': partsOf(previewDetails, 'hours').length
      }"
      :disabled="!store.payload.isClearing || !store.payload.status"
      :title="$t('timesheetPage.previewHint')"
      class="fc-sample"
      type="button"
      @click="onSample"
    >
      <template v-if="previewDetails.length">
        <span class="fc-sample-status">
          <template v-for="(part, i) in partsOf(previewDetails, 'status')" :key="`ps-${i}`">
            <span v-if="i" class="fc-sep">/</span><span :style="{ color: part.color }">{{ part.value }}</span>
          </template>
        </span>
        <span v-if="partsOf(previewDetails, 'hours').length" class="fc-sample-hours">
          <template v-for="(part, i) in partsOf(previewDetails, 'hours')" :key="`ph-${i}`">
            <span v-if="i" class="fc-sep">/</span><span :style="{ color: part.color }">{{ part.value }}</span>
          </template>
        </span>
      </template>
      <span v-else class="fc-sample-empty">—</span>
    </button>
    <n-button
      :class="{ 'fc-eraser-on': store.payload.isClearing }"
      :secondary="!store.payload.isClearing"
      type="error"
      @click="toggleEraser"
    >
      <template #icon>
        <n-icon :component="Eraser20Filled" />
      </template>
      {{ $t('content.clear') }}
    </n-button>
    <slot name="end" />
  </div>
</template>

<style scoped>
  /* Tor ekranda (yoki 2-tur ochilganda) sig'masa — 2-qatorga o'tadi, o'ng tomoni kesilmaydi. */
  .fc {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .fc-types {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  /* Tez tur chipi — kod O'Z rangida (panjaradagi kabi), tanlangani ramkali. */
  /* Ikki harfli kod («MT») qatorga sig'masa ham ikkiga bo'linmasin. */
  .fc-chip {
    flex: 0 0 auto;
    white-space: nowrap;
    min-width: 34px;
    height: 34px;
    padding: 0 8px;
    border: 1px solid var(--surface-line);
    border-radius: 10px;
    background: var(--surface-section);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition:
      border-color 0.12s,
      background 0.12s;
  }
  .fc-chip:hover {
    border-color: var(--primary-color);
  }
  .fc-chip.is-active {
    border-color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 12%, var(--surface-section));
    box-shadow: inset 0 0 0 1px var(--primary-color);
  }
  /* Tur + soat bitta qutida — ichki maydonlar ramkasiz, qutining o'zi ramkali. */
  .fc-pair {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    box-sizing: border-box;
    height: 34px;
    overflow: hidden;
    border: 1px solid var(--surface-line);
    border-radius: 10px;
    background: var(--surface-section);
    transition: border-color 0.12s;
  }
  .fc-pair:hover,
  .fc-pair:focus-within {
    border-color: var(--primary-color);
  }
  /* Ichki maydonlarning o'z foni / ramkasi / balandligi olib tashlanadi — faqat qutining o'zi ko'rinadi. */
  .fc-pair :deep(.n-base-selection),
  .fc-pair :deep(.n-base-selection-label),
  .fc-pair :deep(.n-input),
  .fc-pair :deep(.n-input-wrapper) {
    background: transparent !important;
  }
  .fc-pair :deep(.n-base-selection),
  .fc-pair :deep(.n-base-selection-label),
  .fc-pair :deep(.n-input) {
    --n-height: 32px !important;
    height: 32px;
    min-height: 32px;
  }
  .fc-pair :deep(.n-base-selection__border),
  .fc-pair :deep(.n-base-selection__state-border),
  .fc-pair :deep(.n-input__border),
  .fc-pair :deep(.n-input__state-border) {
    display: none;
  }
  .fc-pair-sep {
    flex: 0 0 1px;
    align-self: stretch;
    margin: 6px 0;
    background: var(--surface-line);
  }
  /* Qat'iy kenglik — tanlangan nom uzunligiga qarab panel «sakramasin». */
  .fc-select {
    flex: 0 0 160px;
    width: 160px;
  }
  .fc-hours-input {
    flex: 0 0 118px;
    width: 118px;
  }
  /* O'chiq maydon (soatsiz tur, 2-tur tanlanmagan) — QIZIL «taqiqlangan» kursor.
     Kursor rangini CSS bilan o'zgartirib bo'lmaydi — shuning uchun kichik SVG rasm. */
  .fc :deep(.n-input--disabled),
  .fc :deep(.n-input--disabled *),
  .fc :deep(.n-base-selection--disabled),
  .fc :deep(.n-base-selection--disabled *) {
    cursor:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='7.5' fill='white' stroke='%23e5383b' stroke-width='2.5'/%3E%3Cpath d='M5 15 15 5' stroke='%23e5383b' stroke-width='2.5'/%3E%3C/svg%3E") 10 10,
      not-allowed !important;
  }
  .fc-hours-unit {
    margin-right: 2px;
    font-size: 13px;
    color: var(--fig-text-secondary);
    white-space: nowrap;
  }
  /* 2-juftlik: kenglik 0 dan o'sadi + chapdan siljib, xira holdan paydo bo'ladi (yopilishda teskari). */
  .fc-extra {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    gap: 8px;
    max-width: 320px;
    overflow: hidden;
  }
  .fc-extra-enter-active,
  .fc-extra-leave-active {
    transition:
      max-width 0.28s ease,
      margin 0.28s ease,
      opacity 0.2s ease,
      transform 0.28s ease;
  }
  .fc-extra-enter-from,
  .fc-extra-leave-to {
    max-width: 0;
    margin-left: -8px;
    opacity: 0;
    transform: translateX(-12px);
  }
  @media (prefers-reduced-motion: reduce) {
    .fc-extra-enter-active,
    .fc-extra-leave-active {
      transition: none;
    }
  }
  .fc-plus {
    font-weight: 600;
    color: var(--fig-text-tertiary);
  }
  .fc-divider {
    width: 1px;
    height: 28px;
    margin: 0 4px;
    background: var(--surface-line);
  }
  /* Natija namunasi — panjara katagi bilan bir xil yozuv. Soatsiz bo'lsa harf katta, o'rtada. */
  .fc-sample {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    height: 36px;
    padding: 0 6px;
    border: 1px dashed var(--surface-line);
    border-radius: 8px;
    background: transparent;
    font-family: inherit;
    line-height: 1;
    cursor: default;
    transition:
      border-color 0.15s,
      box-shadow 0.15s,
      opacity 0.15s;
  }
  /* Faol tugma — «tirik» halqa (asta kengayib so'nadi). Harf cho'tkasi — asosiy (ko'k) rang,
     o'chirg'ich — qizil. Harf rangi ishlatilmaydi: qizil harflar o'chirg'ichga o'xshab qolardi. */
  .fc-sample {
    --fc-ring: var(--primary-color);
  }
  .fc-sample.is-active {
    border-style: solid;
    border-color: var(--fc-ring);
    animation: fc-pulse 0.9s ease-out infinite;
  }
  /* O'chirg'ich yoqilgan — namuna xira, bosilsa harfga qaytadi. */
  .fc-sample.is-dim {
    opacity: 0.55;
  }
  .fc-sample.is-dim:not(:disabled) {
    cursor: pointer;
  }
  .fc-sample.is-dim:not(:disabled):hover {
    opacity: 1;
    border-color: var(--fc-ring);
  }
  .fc-sample-status {
    display: block;
    font-size: 16px;
    font-weight: 800;
    line-height: 18px;
  }
  .fc-sample-hours {
    display: block;
    font-size: 13px;
    font-weight: 700;
    line-height: 15px;
  }
  /* Soat ham bor — harf kichikroq tepada, soat pastda. */
  .fc-sample.is-hours .fc-sample-status {
    font-size: 11px;
    line-height: 13px;
  }
  /* O'chirg'ich faol — qizil halqa. */
  .fc-eraser-on {
    --fc-ring: var(--fig-icon-red);
    animation: fc-pulse 0.9s ease-out infinite;
  }
  @keyframes fc-pulse {
    0% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--fc-ring) 45%, transparent);
    }
    70% {
      box-shadow: 0 0 0 7px color-mix(in srgb, var(--fc-ring) 0%, transparent);
    }
    100% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--fc-ring) 0%, transparent);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .fc-sample.is-active,
    .fc-eraser-on {
      animation: none;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fc-ring) 25%, transparent);
    }
  }
  .fc-sep {
    color: var(--fig-text-tertiary);
    padding: 0 1px;
  }
  .fc-sample-empty {
    color: var(--fig-text-tertiary);
  }
</style>
