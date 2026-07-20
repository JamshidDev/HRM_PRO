<script setup>
  import {
    Search48Filled,
    AddCircle24Regular,
    Filter20Filled,
    DeleteArrowBack20Regular
  } from '@vicons/fluent'
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
    popoverStyle: {
      type: Object,
      default: {
        width: '360px ',
        maxWidth: '100%',
        minHeight: '300px'
      }
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
    filterMaxHeight.value = `${Math.max(available, 200)}px`
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
        :class="[slots.filterSearch || slots.filterBefore ? 'md:max-w-full' : 'md:max-w-[200px]!']"
        class="w-full flex items-center gap-2"
      >
        <slot name="filterBefore"></slot>
        <n-input
          ref="searchInputRef"
          clearable
          class="w-full md:max-w-[200px]! md:w-full!"
          v-if="showSearchInput"
          v-model:value="searchModel"
          type="text"
          :placeholder="$t('content.search')"
          :on-keyup="searchEvent"
          @paste="searchEvent"
          @clear="searchEvent"
          :loading="searchLoading"
        >
          <template #suffix>
            <n-icon :component="Search48Filled" />
          </template>
        </n-input>
        <slot name="filterSearch"></slot>
      </div>
      <div class="flex flex-wrap w-full md:w-[calc(100%-200px)] justify-end gap-4">
        <slot name="filterAction"></slot>
        <n-button
          class="w-full! md:w-auto!"
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
          placement="bottom"
          class="max-w-[95vw] min-w-[280px] sm:min-w-[400px] w-(--v-target-width) md:w-auto"
          :style="{ '--top-activator-width': 'var(--v-target-width)' }"
        >
          <template #trigger>
            <n-badge ref="filterTriggerRef" class="w-full! md:w-auto!" :value="filterCount" processing type="info">
              <n-button class="w-full! md:w-auto!" type="primary" ghost icon-placement="right">
                <template #icon>
                  <n-icon>
                    <Filter20Filled />
                  </n-icon>
                </template>
              </n-button>
            </n-badge>
          </template>
          <div class="flex flex-col max-w-full">
            <div class="flex justify-between">
              <span class="text-sm text-surface-400">{{ $t('content.filterSetting') }}</span>
              <n-button
                @click="emits('onClear')"
                strong
                secondary
                type="error"
                size="tiny"
                class="shadow"
              >
                {{ $t('content.clear') }}
                <template #icon>
                  <DeleteArrowBack20Regular />
                </template>
              </n-button>
            </div>
            <div class="ui-filter-content overflow-y-auto pr-1 -mr-1" :style="{ maxHeight: filterMaxHeight }">
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
.ui-filter-content :deep(:where(.n-select, .n-date-picker)) {
  width: 100%;
}
</style>
