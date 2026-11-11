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
      <n-select
        :consistent-menu-width="false"
        :loading="compStore.timesheetEnumsLoading"
        :options="compStore.timesheetTypes"
        :placeholder="$t('timesheetPage.otherType')"
        :render-label="renderLabel"
        :value="store.payload.isClearing ? null : store.payload.status"
        class="fc-select"
        filterable
        label-field="name"
        value-field="id"
        @update:value="(_, type) => setMainType(type)"
      />
      <!-- «soat» — −/+ tugmalaridan keyin, maydon tashqarisida: «8 − + soat» -->
      <!-- Soat maydoni DOIM joyida (kenglik o'zgarmasin); tur soatsiz bo'lsa — o'chiq. -->
      <label class="fc-hours">
        <n-input-number
          v-model:value="store.payload.hours"
          :disabled="store.payload.isClearing || !typeByIdOrNull(store.payload.status)?.hours"
          :max="24"
          :min="0"
          :precision="0"
          class="fc-hours-input"
          @update:value="emit('pick')"
        />
        <span class="fc-hours-unit">{{ $t('timesheetPage.hoursShort') }}</span>
      </label>
    </div>

    <!-- Ikkinchi juftlik — kerak bo'lganda ochiladi. -->
    <template v-if="extraOpen">
      <span class="fc-plus">+</span>
      <n-select
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
      <!-- «soat» — −/+ tugmalaridan keyin, maydon tashqarisida: «8 − + soat» -->
      <label class="fc-hours">
        <n-input-number
          v-model:value="store.payload.hours2"
          :disabled="store.payload.isClearing || !typeByIdOrNull(store.payload.status2)?.hours"
          :max="24"
          :min="0"
          :precision="0"
          class="fc-hours-input"
          @update:value="emit('pick')"
        />
        <span class="fc-hours-unit">{{ $t('timesheetPage.hoursShort') }}</span>
      </label>
    </template>
    <n-tooltip :delay="300">
      <template #trigger>
        <n-button :type="extraOpen ? 'primary' : 'default'" circle quaternary @click="toggleExtra">
          <template #icon>
            <n-icon :component="extraOpen ? Subtract20Regular : Add20Filled" />
          </template>
        </n-button>
      </template>
      {{ extraOpen ? $t('timesheetPage.removeExtra') : $t('timesheetPage.addExtra') }}
    </n-tooltip>

    <span class="fc-divider" />

    <!-- Katakka aynan nima yoziladi — panjaradagi ko'rinishda. -->
    <div :title="$t('timesheetPage.previewHint')" class="fc-sample">
      <template v-if="previewDetails.length">
        <span class="fc-sample-status">
          <template v-for="(part, i) in partsOf(previewDetails, 'status')" :key="`ps-${i}`">
            <span v-if="i" class="fc-sep">/</span><span :style="{ color: part.color }">{{ part.value }}</span>
          </template>
        </span>
        <span class="fc-sample-hours">
          <template v-for="(part, i) in partsOf(previewDetails, 'hours')" :key="`ph-${i}`">
            <span v-if="i" class="fc-sep">/</span><span :style="{ color: part.color }">{{ part.value }}</span>
          </template>
        </span>
      </template>
      <span v-else class="fc-sample-empty">—</span>
    </div>
    <n-button :secondary="!store.payload.isClearing" type="error" @click="toggleEraser">
      <template #icon>
        <n-icon :component="Eraser20Filled" />
      </template>
      {{ $t('content.clear') }}
    </n-button>
    <slot name="end" />
  </div>
</template>

<style scoped>
  .fc {
    display: flex;
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
  .fc-chip {
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
  /* Qat'iy kenglik — tanlangan nom uzunligiga qarab panel «sakramasin». */
  .fc-select {
    flex: 0 0 170px;
    width: 170px;
  }
  .fc-hours {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .fc-hours-input {
    flex: 0 0 92px;
    width: 92px;
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
    font-size: 13px;
    color: var(--fig-text-secondary);
    white-space: nowrap;
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
  /* Natija namunasi — panjara katagi bilan bir xil yozuv, kichikroq. */
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
  }
  .fc-sample-status {
    display: block;
    height: 12px;
    line-height: 12px;
    font-size: 10px;
    font-weight: 600;
  }
  .fc-sample-hours {
    display: block;
    height: 16px;
    line-height: 16px;
    font-size: 13px;
    font-weight: 700;
  }
  .fc-sep {
    color: var(--fig-text-tertiary);
    padding: 0 1px;
  }
  .fc-sample-empty {
    color: var(--fig-text-tertiary);
  }
</style>
