<script setup>
  // Ta'til kunlari tarkibi: asosiy + o'tgan davrdan qolgan + 41-buyruqdagi qo'shimchalar.
  import { h } from 'vue'
  import { useComponentStore } from '@stores'
  import { Delete16Regular } from '@vicons/fluent'
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
  const restDay = ref(0)
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
        (Number(restDay.value) || 0) +
        items.value.reduce((s, i) => s + (Number(i.value) || 0), 0)
    )
  )

  const onShow = (v) => {
    show.value = v
    if (!v) return
    mainDay.value = props.row.main_day
    restDay.value = Number(props.row.rest_day) || 0
    items.value = (props.row.additional || []).map((i) => ({ id: i.id, value: i.value }))
    addId.value = null
    if (!componentStore.vacationAdditional?.length) componentStore._enums()
  }

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
      rest_day: Number(restDay.value) || 0,
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
      <button
        type="button"
        class="days-cell"
        :class="{ 'days-cell--disabled': disabled }"
        :disabled="disabled"
      >
        <span class="days-chip days-chip--main">
          {{ $t('vacationSchedule.grid.mainDay') }} <b>{{ row.main_day }}</b>
        </span>
        <span v-if="row.rest_day" class="days-chip">
          {{ $t('vacationSchedule.grid.restDay') }} <b>{{ row.rest_day }}</b>
        </span>
        <span v-for="a in row.additional || []" :key="a.id" class="days-chip" :title="nameOf(a.id)">
          <span class="days-chip__name">{{ nameOf(a.id) }}</span> <b>{{ a.value }}</b>
        </span>
        <n-spin v-if="loading" :size="12" />
        <span class="days-total">
          {{ row.all_days }} {{ $t('vacationSchedule.grid.dayUnit') }}
        </span>
      </button>
    </template>
    <div class="days-panel">
      <div class="days-panel__title">{{ $t('vacationSchedule.grid.daysTitle') }}</div>

      <div class="days-line">
        <div class="days-line__text">
          <span class="days-line__label">{{ $t('vacationSchedule.grid.mainDay') }}</span>
          <span class="days-line__hint">{{ $t('vacationSchedule.grid.mainDayHint') }}</span>
        </div>
        <n-input-number
          v-model:value="mainDay"
          class="days-line__input"
          :min="0"
          :max="99"
          :precision="0"
          :show-button="false"
        >
          <template #suffix>{{ $t('vacationSchedule.grid.dayUnit') }}</template>
        </n-input-number>
      </div>

      <div class="days-line">
        <div class="days-line__text">
          <span class="days-line__label">{{ $t('vacationSchedule.grid.restDay') }}</span>
          <span class="days-line__hint">{{ $t('vacationSchedule.grid.restDayHint') }}</span>
        </div>
        <n-input-number
          v-model:value="restDay"
          class="days-line__input"
          :min="0"
          :max="99"
          :precision="0"
          :show-button="false"
        >
          <template #suffix>{{ $t('vacationSchedule.grid.dayUnit') }}</template>
        </n-input-number>
      </div>

      <div class="days-panel__section">{{ $t('vacationSchedule.grid.additionalTitle') }}</div>
      <div v-if="!items.length" class="days-panel__empty">
        {{ $t('vacationSchedule.grid.noAdditional') }}
      </div>
      <div v-for="item in items" :key="item.id" class="days-line days-line--item">
        <span class="days-line__label days-line__label--wrap">{{ nameOf(item.id) }}</span>
        <span class="flex shrink-0 items-center gap-1">
          <n-input-number
            v-model:value="item.value"
            class="days-line__input"
            :min="ADD_MIN"
            :max="ADD_MAX"
            :status="validValue(item.value) ? undefined : 'error'"
            placeholder="1–19"
            :precision="0"
            :show-button="false"
          >
            <template #suffix>{{ $t('vacationSchedule.grid.dayUnit') }}</template>
          </n-input-number>
          <n-button secondary type="error" :title="$t('content.delete')" @click="onRemove(item)">
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
          <b class="text-base text-primary">{{ total }}</b>
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
    width: 460px;
    max-width: 90vw;
    flex-direction: column;
    gap: 8px;
  }
  .days-panel__title {
    padding-bottom: 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-textColor1);
    border-bottom: 1px solid var(--color-surface-line);
  }
  .days-panel__section {
    margin-top: 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-textColor2);
  }
  .days-panel__empty {
    padding: 6px 0;
    font-size: 12px;
    color: var(--color-textColor3);
  }
  .days-panel__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
    padding-top: 8px;
    border-top: 1px solid var(--color-surface-line);
  }
  .days-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 8px;
    border-radius: 8px;
    background: var(--color-surface-ground);
  }
  .days-line__text {
    display: flex;
    min-width: 0;
    flex-direction: column;
  }
  .days-line__label {
    font-size: 13px;
    color: var(--color-textColor1);
  }
  .days-line__label--wrap {
    font-size: 12px;
    line-height: 1.35;
  }
  .days-line__hint {
    font-size: 11px;
    color: var(--color-textColor3);
  }
  .days-line__input {
    width: 90px;
    flex-shrink: 0;
  }
  .days-cell {
    display: flex;
    width: 100%;
    flex-wrap: nowrap;
    overflow: hidden;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    border: 1px solid var(--color-surface-line);
    border-radius: 8px;
    text-align: left;
    cursor: pointer;
  }
  .days-cell:hover {
    border-color: var(--color-primary);
  }
  .days-cell--disabled {
    cursor: default;
  }
  .days-cell--disabled:hover {
    border-color: var(--color-surface-line);
  }
  .days-chip {
    display: inline-flex;
    max-width: 200px;
    min-width: 0;
    flex-shrink: 1;
    align-items: center;
    white-space: nowrap;
    line-height: 1.3;
    gap: 4px;
    padding: 1px 6px;
    border-radius: 6px;
    font-size: 11px;
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }
  .days-chip__name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .days-chip b {
    flex-shrink: 0;
    color: var(--color-primary);
  }
  .days-chip--main,
  .days-total {
    flex-shrink: 0;
  }
  .days-total {
    margin-left: auto;
    padding: 1px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-primary);
    background: var(--color-surface-ground);
  }
</style>
