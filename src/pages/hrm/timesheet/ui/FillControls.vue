<script setup>
  /*
   * Belgilangan kataklarga nima yozilishi: tez tur chiplari, «Boshqa tur»,
   * soat, ixtiyoriy 2-tur, natija namunasi va «Qo'llash» / «Tozalash».
   *
   * Ikki joyda ishlatiladi (`Timesheet.vue`): suzuvchi tanlov paneli (C) va
   * panjara ustidagi asboblar qatori (A). Tanlangan tur `store.payload` da —
   * ikkala joy bitta qiymatni ko'radi.
   */
  import { Add20Filled, Checkmark20Filled, Eraser20Filled, Subtract20Regular } from '@vicons/fluent'
  import { h } from 'vue'
  import { useComponentStore, useTimesheetWorkerStore } from '@/store/modules/index.js'
  import { colorOfDetail } from './timesheetGrid.js'
  import { quickTypeIds } from './quickTypes.js'

  defineProps({
    // Tanlov bor va tur/soat to'liq — «Qo'llash» faol.
    canApply: { type: Boolean, default: false },
    // Tanlov bor — «Tozalash» faol.
    hasSelection: { type: Boolean, default: false },
    previewDetails: { type: Array, default: () => [] }
  })
  const emit = defineEmits(['apply', 'clear'])

  const store = useTimesheetWorkerStore()
  const compStore = useComponentStore()

  const typeByIdOrNull = (id) =>
    id == null ? null : (compStore.timesheetTypes?.find((v) => v.id === id) ?? null)

  // Tez-tez ishlatiladigan turlar — standart to'plam yoki foydalanuvchi «Ma'lumot» oynasida tanlagani.
  const DEFAULT_HOURS = 8
  const quickTypes = computed(() => quickTypeIds.value.map(typeByIdOrNull).filter(Boolean))

  const setMainType = (type) => {
    store.payload.status = type?.id ?? null
    if (!type?.hours) store.payload.hours = null
    else if (store.payload.hours == null) store.payload.hours = DEFAULT_HOURS
  }
  const setExtraType = (type) => {
    store.payload.status2 = type?.id ?? null
    if (!type?.hours) store.payload.hours2 = null
    else if (store.payload.hours2 == null) store.payload.hours2 = DEFAULT_HOURS
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
            :class="{ 'is-active': store.payload.status === type.id }"
            :style="{ color: colorOfDetail({ status_id: type.id }) }"
            class="fc-chip"
            type="button"
            @click="setMainType(type)"
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
        :value="store.payload.status"
        class="fc-select"
        filterable
        label-field="name"
        value-field="id"
        @update:value="(_, type) => setMainType(type)"
      />
      <!-- «soat» — −/+ tugmalaridan keyin, maydon tashqarisida: «8 − + soat» -->
      <label v-if="typeByIdOrNull(store.payload.status)?.hours" class="fc-hours">
        <n-input-number
          v-model:value="store.payload.hours"
          :max="24"
          :min="0"
          :precision="0"
          class="fc-hours-input"
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
      <label v-if="typeByIdOrNull(store.payload.status2)?.hours" class="fc-hours">
        <n-input-number
          v-model:value="store.payload.hours2"
          :max="24"
          :min="0"
          :precision="0"
          class="fc-hours-input"
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
    <n-button :disabled="!canApply" type="primary" @click="emit('apply')">
      <template #icon>
        <n-icon :component="Checkmark20Filled" />
      </template>
      {{ $t('timesheetPage.apply') }}
    </n-button>
    <n-button :disabled="!hasSelection" secondary type="error" @click="emit('clear')">
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
  .fc-select {
    width: 170px;
  }
  .fc-hours {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .fc-hours-input {
    width: 92px;
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
