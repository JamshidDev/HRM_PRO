<script setup>
  import Utils from '@/utils/Utils.js'
  import { CalendarLtr24Regular, ChevronLeft12Filled, ChevronRight12Filled, Dismiss16Regular } from '@vicons/fluent'

  const year = defineModel('year', { type: [Number, null], default: null })
  const month = defineModel('month', { type: [Number, null], default: null })

  const props = defineProps({
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: 'Tanlang' }
  })

  const emit = defineEmits(['change'])

  const show = ref(false)
  const localYear = ref(year.value || new Date().getFullYear())

  watch(year, (v) => {
    if (v) localYear.value = v
  })

  const displayText = computed(() => {
    if (!year.value && !month.value) return ''
    const monthName = Utils.monthList.find((m) => m.id === month.value)?.name || ''
    return `${year.value || ''}, ${monthName}`
  })

  const isSelected = (monthId) => {
    return month.value === monthId && year.value === localYear.value
  }

  const isCurrentMonth = (monthId) => {
    const now = new Date()
    return now.getFullYear() === localYear.value && now.getMonth() + 1 === monthId
  }

  const prevYear = () => { localYear.value-- }
  const nextYear = () => { localYear.value++ }

  const selectMonth = (monthId) => {
    year.value = localYear.value
    month.value = monthId
    emit('change')
    show.value = false
  }

  const onClear = (e) => {
    e.stopPropagation()
    year.value = null
    month.value = null
    emit('change')
  }
</script>

<template>
  <n-popover
    v-model:show="show"
    trigger="click"
    placement="bottom-start"
    :show-arrow="false"
    :content-style="{ padding: 0 }"
  >
    <template #trigger>
      <n-input
        :value="displayText"
        :placeholder="placeholder"
        readonly
        class="ym-input"
        :class="{ 'ym-input--active': show }"
      >
        <template #prefix>
          <n-icon :size="16" :color="show ? 'var(--n-caret-color)' : undefined">
            <CalendarLtr24Regular />
          </n-icon>
        </template>
        <template v-if="clearable && displayText" #suffix>
          <n-icon :size="14" class="ym-clear" @click="onClear">
            <Dismiss16Regular />
          </n-icon>
        </template>
      </n-input>
    </template>

    <div class="ym-panel">
      <div class="ym-panel__header">
        <n-button quaternary circle size="tiny" @click="prevYear">
          <template #icon>
            <n-icon :size="18"><ChevronLeft12Filled /></n-icon>
          </template>
        </n-button>
        <span class="ym-panel__year">{{ localYear }}</span>
        <n-button quaternary circle size="tiny" @click="nextYear">
          <template #icon>
            <n-icon :size="18"><ChevronRight12Filled /></n-icon>
          </template>
        </n-button>
      </div>
      <div class="ym-panel__grid">
        <div
          v-for="m in Utils.monthList"
          :key="m.id"
          class="ym-panel__cell"
          :class="{
            'ym-panel__cell--selected': isSelected(m.id),
            'ym-panel__cell--current': !isSelected(m.id) && isCurrentMonth(m.id)
          }"
          @click="selectMonth(m.id)"
        >
          {{ m.name }}
        </div>
      </div>
    </div>
  </n-popover>
</template>

<style scoped>
  .ym-input {
    cursor: pointer;
  }

  .ym-input :deep(.n-input__input-el) {
    cursor: pointer;
    caret-color: transparent !important;
  }

  .ym-clear {
    cursor: pointer;
    color: var(--n-clear-color, rgba(194, 194, 194, 1));
    transition: color 0.2s ease;
  }

  .ym-clear:hover {
    color: var(--n-clear-color-hover, rgba(146, 146, 146, 1));
  }

  .ym-panel {
    width: 220px;
    padding: 4px 0;
    user-select: none;
  }

  .ym-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .ym-panel__year {
    font-weight: 600;
    font-size: 13px;
    color: var(--n-text-color, #434349);
  }

  .ym-panel__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
  }

  .ym-panel__cell {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5px 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--n-text-color, #434349);
    border: 1px solid var(--surface-line, #e5e5e5);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .ym-panel__cell:hover {
    background: rgba(18, 121, 240, 0.08);
    color: #1279F0;
  }

  .ym-panel__cell:active {
    transform: scale(0.96);
  }

  .ym-panel__cell--selected {
    background: var(--n-caret-color, #1279F0);
    color: #fff;
  }

  .ym-panel__cell--selected:hover {
    background: var(--n-caret-color, #1279F0);
    opacity: 0.9;
    color: #fff;
  }

  .ym-panel__cell--current {
    border-color: var(--n-caret-color, #1279F0);
  }
</style>
