<script setup>
  import { AddCircle24Regular } from '@vicons/fluent'
  import clearFilterIcon from '@/assets/icons/clear_filter.svg?url'
  import filterIcon from '@/assets/icons/filter.svg?url'
  import searchIcon from '@/assets/icons/search.svg?url'
  const slots = useSlots()
  const props = defineProps({
    title: {
      type: String,
      default: null
    },
    showSearchInput: {
      type: Boolean,
      default: true
    },
    showAddButton: {
      type: Boolean,
      default: true
    },
    showFilterButton: {
      type: Boolean,
      default: true
    },
    filterCount: {
      type: Number,
      default: 0
    },
    filterPlacement: {
      type: String,
      default: 'bottom-end'
    },
    popoverStyle: {
      type: Object,
      default: () => ({
        width: '560px',
        maxWidth: 'calc(100vw - 32px)',
        minHeight: 'auto',
        padding: '0',
        borderRadius: '20px'
      })
    },
    searchLoading: {
      type: Boolean,
      default: false
    },
    autoFocusInput: {
      type: Boolean,
      default: true
    },
    addButtonTitle: {
      type: String,
      default: null
    }
  })
  const hasFullFilterSlot = !!slots.fullFilterContent
  const searchModel = defineModel('search', { type: String, default: null })
  const searchInputRef = ref(null)
  const filterTriggerRef = ref(null)
  const filterMaxHeight = ref('70vh')

  const emits = defineEmits(['onAdd', 'onSearch', 'onClear', 'show'])

  let timeout = null
  const searchEvent = () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      emits('onSearch', searchModel.value)
    }, 1000)
  }

  const addEvent = () => {
    emits('onAdd')
  }

  const updateFilterMaxHeight = () => {
    const el = filterTriggerRef.value?.$el ?? filterTriggerRef.value
    if (!el) return
    const bottomMargin = 16
    const available = window.innerHeight - el.getBoundingClientRect().bottom - bottomMargin
    const headerHeight = 48
    const viewportLimit = window.innerHeight * 0.7
    filterMaxHeight.value = `${Math.max(Math.min(available - headerHeight, viewportLimit), 200)}px`
  }

  const onFilterShow = (v) => {
    emits('show', v)
    if (!v) return
    nextTick(updateFilterMaxHeight)
    window.addEventListener('resize', updateFilterMaxHeight)
  }

  onMounted(() => {
    if (!props.autoFocusInput) return
    searchInputRef.value?.focus()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateFilterMaxHeight)
  })
</script>

<template>
  <div class="grid grid-cols-1">
    <div v-if="title">
      <span class="text-lg font-semibold inline-block mb-2 text-surface-600">{{ title }}</span>
    </div>
    <div class="flex flex-col items-end md:flex-row gap-4">
      <div
        :class="[slots.filterSearch || slots.filterBefore ? 'md:max-w-full' : 'md:max-w-[264px]!']"
        class="w-full flex items-center gap-2"
      >
        <slot name="filterBefore"></slot>
        <n-input
          ref="searchInputRef"
          clearable
          class="ui-page-search w-full md:max-w-[264px]! md:w-full!"
          v-if="showSearchInput"
          v-model:value="searchModel"
          type="text"
          :placeholder="$t('content.search')"
          :on-keyup="searchEvent"
          @paste="searchEvent"
          @clear="searchEvent"
          :loading="searchLoading"
        >
          <template #prefix>
            <img class="ui-page-search-icon" :src="searchIcon" alt="" />
          </template>
        </n-input>
        <slot name="filterSearch"></slot>
      </div>
      <div class="flex flex-wrap w-full md:w-[calc(100%-264px)] justify-end gap-4">
        <slot name="filterAction"></slot>
        <n-button
          class="ui-page-action-button w-full! md:w-auto!"
          v-if="showAddButton"
          type="primary"
          icon-placement="right"
          @click="addEvent"
        >
          <template #icon>
            <n-icon>
              <AddCircle24Regular />
            </n-icon>
          </template>
          {{ addButtonTitle || $t('content.add') }}
        </n-button>
        <n-popover
          @update:show="onFilterShow"
          v-if="showFilterButton"
          trigger="click"
          scrollable
          :placement="filterPlacement"
          class="max-w-[95vw] min-w-[280px] sm:min-w-[400px] w-(--v-target-width) md:w-auto"
          :style="{ ...popoverStyle, '--top-activator-width': 'var(--v-target-width)' }"
        >
          <template #trigger>
            <n-button
              ref="filterTriggerRef"
              class="ui-page-filter-button w-full! md:w-auto!"
              type="primary"
              ghost
            >
              <template #icon>
                <img class="ui-page-filter-icon" :src="filterIcon" alt="" />
              </template>
              <span>{{ $t('content.filters') }}</span>
              <span v-if="filterCount > 0" class="ui-page-filter-count">{{ filterCount }}</span>
            </n-button>
          </template>
          <div class="flex flex-col max-w-full">
            <slot name="filterHeader">
              <div class="ui-filter-header">
                <div class="ui-filter-header-title">
                  <img :src="filterIcon" alt="" />
                  <span>{{ $t('content.filterSetting') }}</span>
                </div>
                <button type="button" class="ui-filter-clear" @click="emits('onClear')">
                  <img :src="clearFilterIcon" alt="" />
                  <span>{{ $t('content.clearFilters') }}</span>
                </button>
              </div>
            </slot>
            <div class="ui-filter-content overflow-y-auto" :style="{ maxHeight: filterMaxHeight }">
              <slot name="filterContent"></slot>
            </div>
          </div>
        </n-popover>
      </div>
    </div>
    <div v-if="hasFullFilterSlot" class="w-full">
      <slot name="fullFilterContent"></slot>
    </div>
  </div>
</template>

<style scoped>
.ui-page-search {
  --n-height: 44px !important;
  --n-border-radius: 16px !important;
  --n-font-size: 14px !important;
}

.ui-page-search :deep(.n-input-wrapper) {
  padding: 0 16px;
}

.ui-page-search-icon {
  width: 13.5px;
  height: 13.5px;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
  color: var(--textColor2);
}

.ui-page-search :deep(.n-input__prefix) {
  margin-right: 8px;
}

.ui-page-search :deep(.n-input__placeholder) {
  color: var(--textColor2);
}

.ui-page-action-button,
.ui-page-filter-button {
  --n-height: 44px !important;
  --n-border-radius: 12px !important;
}

.ui-page-action-button {
  --n-padding: 0 16px !important;
}

.ui-page-filter-button {
  --n-padding: 0 16px !important;
  font-weight: 600;
}

.ui-page-filter-button :deep(.n-button__content) {
  gap: 8px;
}

.ui-page-filter-icon {
  width: 20px;
  height: 20px;
}

.ui-page-filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  color: #fff;
  background: #ef3e42;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.ui-filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 48px;
  padding: 0 20px;
  border-radius: 18px 18px 0 0;
  color: var(--primary-color);
  background: var(--color-brand-surface);
  font-size: 14px;
  font-weight: 600;
}

.ui-filter-header-title,
.ui-filter-clear {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ui-filter-header-title img,
.ui-filter-clear img {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.ui-filter-clear {
  flex-shrink: 0;
  padding: 6px 8px;
  border: 0;
  border-radius: 8px;
  color: #e5383b;
  background: transparent;
  cursor: pointer;
  font: inherit;
  transition: background-color 0.2s ease;
}

.ui-filter-clear:hover {
  background: rgba(229, 56, 59, 0.08);
}

.ui-filter-content {
  padding: 24px 32px 28px;
  overscroll-behavior: contain;
}

.ui-filter-content :deep(label) {
  display: block;
  margin-bottom: 6px;
  color: var(--textColor1);
  font-size: 13px;
  font-weight: 500;
}

.ui-filter-content :deep(:where(.n-select, .n-date-picker, .n-input-number, .ui__structure-input)) {
  width: 100%;
  min-height: 40px;
  --n-height: 40px !important;
  --n-border-radius: 16px !important;
}

.ui-filter-content :deep(:where(.n-base-selection, .n-input, .n-input-number)) {
  min-height: 40px;
  --n-height: 40px !important;
  --n-border-radius: 16px !important;
  border-radius: 16px !important;
}

.ui-filter-content :deep(
  :where(
    .n-base-selection-label,
    .n-base-selection__border,
    .n-base-selection__state-border,
    .n-input__border,
    .n-input__state-border
  )
) {
  border-radius: 16px !important;
}

.ui-filter-content :deep(.n-select) {
  --n-padding-single: 0 12px !important;
  --n-padding-multiple: 0 12px !important;
}

.ui-filter-content :deep(.n-base-selection-label),
.ui-filter-content :deep(.ui__structure-input .n-input-wrapper),
.ui-filter-content :deep(.n-input-number .n-input-wrapper) {
  padding-left: 12px;
  padding-right: 12px;
}

.ui-filter-content :deep(.n-badge) {
  --n-color: #ef3e42 !important;
}

.ui-filter-content :deep(.n-badge-sup) {
  background-color: #ef3e42 !important;
}

.ui-filter-content :deep(.ui-filter-grid label) {
  display: block;
  margin-bottom: 6px;
  color: var(--textColor1);
  font-size: 13px;
  font-weight: 500;
}

.ui-filter-content :deep(.ui-filter-grid :where(.n-select, .n-date-picker, .n-input-number)) {
  width: 100%;
  min-height: 40px;
  --n-height: 40px !important;
  --n-border-radius: 16px !important;
}

.ui-filter-content :deep(.ui-filter-grid .n-select) {
  --n-padding-single: 0 12px !important;
  --n-padding-multiple: 0 12px !important;
}

.ui-filter-content :deep(.ui-filter-grid .n-base-selection-label),
.ui-filter-content :deep(.ui-filter-grid .ui__structure-input .n-input-wrapper),
.ui-filter-content :deep(.ui-filter-grid .n-input-number .n-input-wrapper) {
  padding-left: 12px;
  padding-right: 12px;
}
</style>
