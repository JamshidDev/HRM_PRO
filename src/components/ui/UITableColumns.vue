<script setup>
  import { VueDraggable } from 'vue-draggable-plus'
  import { AddCircle24Regular, ReOrderDotsVertical16Regular } from '@vicons/fluent'
  import { UIDrawer } from '@/components/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const props = defineProps({
    // Every customizable column: [{ key, title, visible }], in the order they'll render.
    columns: {
      type: Array,
      required: true
    }
  })

  const emit = defineEmits(['update:columns', 'reset'])

  const visible = ref(false)

  const localColumns = computed({
    get: () => props.columns,
    set: (v) => emit('update:columns', v)
  })

  const setVisible = (key, checked) => {
    // Keep at least one column visible so the table can't be emptied out entirely.
    if (!checked && props.columns.filter((c) => c.visible).length <= 1) return

    emit(
      'update:columns',
      props.columns.map((c) => (c.key === key ? { ...c, visible: checked } : c))
    )
  }

  const allChecked = computed(() => props.columns.every((c) => c.visible))
  const indeterminate = computed(() => !allChecked.value && props.columns.some((c) => c.visible))

  const toggleAll = (checked) => {
    emit('update:columns', props.columns.map((c) => ({ ...c, visible: checked })))
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
      <div
        class="flex items-center gap-2 rounded-lg px-2 py-1.5 mb-2 border border-surface-line hover:bg-surface-ground-soft"
      >
        <n-checkbox
          :checked="allChecked"
          :indeterminate="indeterminate"
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
          :key="col.key"
          class="flex items-center gap-2 rounded-lg px-2 py-1.5 border border-surface-line hover:bg-surface-ground-soft"
        >
          <n-checkbox
            :checked="col.visible"
            class="flex-1 min-w-0"
            @update:checked="(v) => setVisible(col.key, v)"
          >
            <span class="text-sm truncate">{{ col.title }}</span>
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

      <div class="flex justify-end pt-3 mt-2 border-t border-surface-line">
        <n-button text type="primary" size="small" @click="emit('reset')">
          {{ t('content.resetColumns') }}
        </n-button>
      </div>
    </template>
  </UIDrawer>
</template>
