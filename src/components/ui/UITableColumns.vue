<script setup>
  import { VueDraggable } from 'vue-draggable-plus'
  import { AddCircle24Regular, ArrowReset24Regular, ReOrderDotsVertical16Regular } from '@vicons/fluent'
  import { UIDrawer, UISearchInput } from '@/components/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const props = defineProps({
    // Every customizable column: [{ key, title, fullTitle, visible }], in the order they'll render.
    columns: {
      type: Array,
      required: true
    }
  })

  const emit = defineEmits(['update:columns', 'reset'])

  const visible = ref(false)
  const search = ref('')

  const localColumns = computed({
    get: () => props.columns,
    set: (v) => emit('update:columns', v)
  })

  // Uzbek apostrophes (bo'lim) show up as several different glyphs, and column titles carry
  // punctuation (parentheses, hyphens, …) people don't bother typing — strip all of it before
  // comparing so any variant, or skipping it entirely, still matches.
  const normalize = (str) =>
    str
      .toString()
      .toLowerCase()
      .replace(/['’‘ʻʼ`´ʹ\-_(),.:;!?"«»/\\[\]{}]/g, '')

  const matchesSearch = (col) => {
    const query = normalize(search.value.trim())
    if (!query) return true
    return normalize(col.fullTitle || col.title || '').includes(query)
  }

  const filteredColumns = computed(() => props.columns.filter(matchesSearch))

  const setVisible = (key, checked) => {
    // Keep at least one column visible so the table can't be emptied out entirely.
    if (!checked && props.columns.filter((c) => c.visible).length <= 1) return

    emit(
      'update:columns',
      props.columns.map((c) => (c.key === key ? { ...c, visible: checked } : c))
    )
  }

  const visibleCount = computed(() => props.columns.filter((c) => c.visible).length)
  const totalCount = computed(() => props.columns.length)

  const allChecked = computed(
    () => filteredColumns.value.length > 0 && filteredColumns.value.every((c) => c.visible)
  )
  const indeterminate = computed(
    () => !allChecked.value && filteredColumns.value.some((c) => c.visible)
  )

  const toggleAll = (checked) => {
    const matchedKeys = new Set(filteredColumns.value.map((c) => c.key))
    const next = props.columns.map((c) => (matchedKeys.has(c.key) ? { ...c, visible: checked } : c))

    // Keep at least one column visible so the table can't be emptied out entirely.
    if (!checked && next.length > 0 && next.every((c) => !c.visible)) {
      next[0] = { ...next[0], visible: true }
    }

    emit('update:columns', next)
  }
</script>

<template>
  <n-button
    quaternary
    circle
    size="small"
    :title="t('content.manageColumns')"
    @click.stop="visible = true"
  >
    <template #icon>
      <n-icon size="18" class="text-primary"><AddCircle24Regular /></n-icon>
    </template>
  </n-button>

  <UIDrawer
    v-model:visible="visible"
    :title="t('content.manageColumns')"
    :width="400"
    height="min(70vh, 640px)"
  >
    <template #content>
      <div class="flex items-center gap-2 mb-2">
        <UISearchInput v-model:value="search" size="medium" class="flex-1 min-w-0" />
        <n-button
          size="medium"
          class="shrink-0"
          :title="t('content.resetColumns')"
          @click="emit('reset')"
        >
          <template #icon>
            <n-icon size="18"><ArrowReset24Regular /></n-icon>
          </template>
          <span class="text-xs text-textColor3">{{ visibleCount }}/{{ totalCount }}</span>
        </n-button>
      </div>

      <div
        class="flex items-center gap-2 rounded-lg px-2 py-1.5 mb-2 border border-surface-line hover:bg-surface-ground-soft"
      >
        <n-checkbox
          :checked="allChecked"
          :indeterminate="indeterminate"
          :disabled="filteredColumns.length === 0"
          class="flex-1 min-w-0"
          @update:checked="toggleAll"
        >
          <span class="text-sm font-medium">{{ t('content.selectAll') }}</span>
        </n-checkbox>
      </div>

      <VueDraggable
        v-model="localColumns"
        :animation="150"
        handle=".column-drag-handle"
        class="flex flex-col gap-2"
      >
        <div
          v-for="col in localColumns"
          v-show="matchesSearch(col)"
          :key="col.key"
          class="flex items-center gap-2 rounded-lg px-2 py-1.5 border border-surface-line hover:bg-surface-ground-soft"
        >
          <n-checkbox
            :checked="col.visible"
            class="flex-1 min-w-0"
            @update:checked="(v) => setVisible(col.key, v)"
          >
            <span class="text-sm truncate">{{ col.fullTitle || col.title }}</span>
          </n-checkbox>
          <n-icon
            class="column-drag-handle cursor-grab shrink-0"
            size="16"
            color="var(--textColor3)"
          >
            <ReOrderDotsVertical16Regular />
          </n-icon>
        </div>
      </VueDraggable>

      <div v-if="search && filteredColumns.length === 0" class="text-center text-sm text-textColor3 py-4">
        {{ t('content.notFoundData') }}
      </div>
    </template>
  </UIDrawer>
</template>
