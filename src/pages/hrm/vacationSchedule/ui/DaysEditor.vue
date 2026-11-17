<script setup>
  // Ta'til kunlari tarkibi: asosiy + o'tgan davrdan qolgan + 41-buyruqdagi qo'shimchalar.
  import { h } from 'vue'
  import { useComponentStore } from '@stores'
  import { Delete16Regular, Edit16Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const props = defineProps({
    row: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  })
  const emit = defineEmits(['save'])

  const { t } = i18n.global
  const componentStore = useComponentStore()
  const SECOND_DAY_ID = 'second_day'

  const show = ref(false)
  const mainDay = ref(0)
  const items = ref([])
  const addId = ref(null)

  const options = computed(() => [
    { id: SECOND_DAY_ID, name: t('vacationSchedule.grid.secondDay') },
    ...(componentStore.vacationAdditional || [])
  ])
  // Uzun qo'shimcha nomlari ro'yxatda kesilmasin — qatorga o'raladi.
  const wrapLabel = (o) =>
    h('div', { style: 'white-space: normal; line-height: 1.35; padding: 3px 0' }, o.name)
  const nameOf = (id) => options.value.find((o) => String(o.id) === String(id))?.name ?? id
  const freeOptions = computed(() =>
    options.value.filter((o) => !items.value.some((i) => String(i.id) === String(o.id)))
  )
  const total = computed(() =>
    Math.max(
      0,
      (Number(mainDay.value) || 0) +
        (Number(props.row.rest_day) || 0) +
        items.value.reduce((s, i) => s + (Number(i.value) || 0), 0)
    )
  )

  // Katakda faqat jami kun ko'rinadi (tarkibi — bosilganda ochiladigan oynada).
  const cellTotal = computed(() => {
    if (Number(props.row.all_days)) return Number(props.row.all_days)
    const extra = (props.row.additional || []).reduce((sum, a) => sum + (Number(a.value) || 0), 0)
    return (Number(props.row.main_day) || 0) + (Number(props.row.rest_day) || 0) + extra
  })

  const onShow = (v) => {
    show.value = v
    if (!v) return
    mainDay.value = props.row.main_day
    items.value = (props.row.additional || []).map((i) => ({ id: i.id, value: i.value }))
    addId.value = null
    if (!componentStore.vacationAdditional?.length) componentStore._enums()
  }

  // Asosiy ta'til qonun bo'yicha kamida 21 kun — kam bo'lsa faqat ogohlantiriladi (bloklanmaydi:
  // ba'zi xodimlarda kun allaqachon ishlatilgan bo'lishi mumkin).
  const MAIN_MIN = 21
  const mainLow = computed(() => (Number(mainDay.value) || 0) < MAIN_MIN)

  // Qo'shimcha kun 1–19 butun son bo'lmasa «Qo'llash» yopiq.
  const ADD_MIN = 1
  const ADD_MAX = 19
  const validValue = (v) => Number.isInteger(v) && v >= ADD_MIN && v <= ADD_MAX
  const canApply = computed(() => items.value.every((i) => validValue(i.value)))

  const onAdd = (id) => {
    if (id === null || id === undefined) return
    items.value.push({ id, value: null })
    nextTick(() => (addId.value = null))
  }

  // Avval qo'llangan band ham olib tashlanadi — xatoni tuzatish uchun.
  const onRemove = (item) => {
    items.value = items.value.filter((i) => i !== item)
  }

  const onSave = () => {
    if (!canApply.value) return
    emit('save', {
      main_day: Number(mainDay.value) || 0,
      additional: items.value.map((i) => ({ id: i.id, value: Number(i.value) || 0 }))
    })
    show.value = false
  }
</script>

<template>
  <n-popover
    trigger="click"
    placement="bottom-end"
    :show="show"
    :disabled="disabled"
    @update:show="onShow"
  >
    <template #trigger>
      <!-- Oddiy maydon emas: ko'k fon + ✏️ — bosilsa kunlar tarkibi oynasi ochiladi; 0 kun — sariq ramka -->
      <n-input
        class="days-field"
        :class="{ 'days-field--empty': !cellTotal }"
        readonly
        :value="`${cellTotal} ${$t('vacationSchedule.grid.dayUnit')}`"
        :disabled="disabled"
        :status="cellTotal ? undefined : 'warning'"
        :loading="loading || undefined"
      >
        <template #suffix>
          <n-icon v-if="!disabled" class="days-field__icon"><Edit16Regular /></n-icon>
        </template>
      </n-input>
    </template>

    <div class="days-panel">
      <div class="days-row">
        <span class="days-row__label">{{ $t('vacationSchedule.grid.mainDay') }}</span>
        <n-input-number
          v-model:value="mainDay"
          class="days-row__input"
          :min="0"
          :max="99"
          :precision="0"
          :show-button="false"
          :status="mainLow ? 'warning' : undefined"
        >
          <template #suffix>{{ $t('vacationSchedule.grid.dayUnit') }}</template>
        </n-input-number>
      </div>

      <div class="days-row">
        <span class="days-row__label">{{ $t('vacationSchedule.grid.restDay') }}</span>
        <span class="days-row__value">
          {{ row.rest_day || 0 }} {{ $t('vacationSchedule.grid.dayUnit') }}
        </span>
      </div>

      <div v-for="item in items" :key="item.id" class="days-row">
        <span class="days-row__label days-row__label--wrap">{{ nameOf(item.id) }}</span>
        <span class="flex shrink-0 items-center gap-1">
          <n-input-number
            v-model:value="item.value"
            class="days-row__input"
            :min="ADD_MIN"
            :max="ADD_MAX"
            :status="validValue(item.value) ? undefined : 'error'"
            placeholder="1–19"
            :precision="0"
            :show-button="false"
          >
            <template #suffix>{{ $t('vacationSchedule.grid.dayUnit') }}</template>
          </n-input-number>
          <n-button
            quaternary
            circle
            type="error"
            :title="$t('content.delete')"
            @click="onRemove(item)"
          >
            <template #icon>
              <n-icon><Delete16Regular /></n-icon>
            </template>
          </n-button>
        </span>
      </div>

      <n-select
        v-if="freeOptions.length"
        v-model:value="addId"
        :options="freeOptions"
        label-field="name"
        value-field="id"
        :placeholder="$t('vacationSchedule.grid.addAdditional')"
        :render-label="wrapLabel"
        @update:value="onAdd"
      />

      <div class="days-panel__footer">
        <span class="text-sm text-textColor2">
          {{ $t('vacationSchedule.grid.total') }}:
          <b class="text-base text-textColor0">{{ total }}</b>
          {{ $t('vacationSchedule.grid.dayUnit') }}
        </span>
        <span class="flex gap-2">
          <n-button @click="show = false">{{ $t('content.cancel') }}</n-button>
          <n-button type="primary" :disabled="!canApply" @click="onSave">
            {{ $t('vacationSchedule.grid.applyDays') }}
          </n-button>
        </span>
      </div>
    </div>
  </n-popover>
</template>

<style scoped>
  .days-panel {
    display: flex;
    width: 380px;
    max-width: 90vw;
    flex-direction: column;
    gap: 10px;
  }
  .days-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .days-row__label {
    font-size: 13px;
    color: var(--color-textColor1);
  }
  .days-row__label--wrap {
    font-size: 12px;
    line-height: 1.35;
  }
  .days-row__input {
    width: 96px;
    flex-shrink: 0;
  }
  .days-row__value {
    width: 96px;
    flex-shrink: 0;
    padding-right: 12px;
    text-align: right;
    font-size: 13px;
    color: var(--color-textColor2);
  }
  .days-panel__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 10px;
    border-top: 1px solid var(--color-surface-line);
  }

  /* Katak — bosiladigan «maxsus» maydon: och ko'k fon, ko'k matn va qalam belgisi */
  .days-field:not(.n-input--disabled):not(.days-field--empty) {
    --n-color: color-mix(in srgb, var(--color-primary) 8%, transparent) !important;
    --n-color-focus: color-mix(in srgb, var(--color-primary) 12%, transparent) !important;
    --n-border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent) !important;
    --n-text-color: var(--color-primary) !important;
  }
  .days-field :deep(input) {
    cursor: pointer;
    font-weight: 600;
  }
  .days-field__icon {
    color: var(--color-primary);
  }
</style>
