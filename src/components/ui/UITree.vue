<script setup>
  import { ChevronRight16Filled } from '@vicons/fluent'
  import { UIMenuButton } from '@/components/index.js'
  const props = defineProps({
    children: Array,
    deep: {
      type: Number,
      default: 0
    },
    id: {
      type: String,
      default: '0'
    },
    elementId: {
      type: String,
      default: null
    },
    actionLoading: {
      type: Boolean,
      default: false
    },
    actionLoadingId: {
      type: [Number, String],
      default: null
    },
    expandedKeys: {
      type: Array,
      default: () => []
    }
  })

  const emits = defineEmits(['onLoad', 'onChange', 'onToggle'])

  const onLoad = (v) => {
    emits('onLoad', v)
  }

  const onChange = (v) => {
    emits('onChange', v)
  }

  const onMenuSelect = (item, idx, ev) => {
    const payload = {
      id: item.id,
      name: item.name,
      index: `${props.id}-${idx}`
    }
    if (ev.key === 'edit') {
      onChange({ ...payload, type: 'update' })
    } else if (ev.key === 'delete') {
      onChange({ ...payload, type: 'delete' })
    } else if (ev.key === 'attachment') {
      onChange({ ...payload, type: 'create' })
    }
  }

  const isExpanded = (key) => props.expandedKeys.includes(key)

  const onToggle = (v) => {
    emits('onToggle', v)
  }

  const handleToggle = (item, key) => {
    const opened = isExpanded(key)
    if (!opened && item?.isHaveChild && (!Array.isArray(item.children) || item.children.length === 0)) {
      onLoad({ index: key, id: item.id })
    }
    onToggle(key)
  }

  const isLastItem = (idx, length) => idx === length - 1
</script>

<template>
  <template v-for="(item, idx) in children" :key="idx">
    <div
      class="org-tree-lines flex items-stretch overflow-visible"
    >
      <template v-if="deep > 0">
        <div v-for="i in deep" :key="`deep-${i}`" class="w-[20px] min-h-[44px] border__center-line"></div>
      </template>
      <div
        :class="[isLastItem(idx, children.length) && 'line-half']"
        class="w-[20px] min-h-[44px] border__center-line border__center-content"
      ></div>

      <div
        class="flex flex-1 items-center gap-2 rounded-lg border border-surface-line bg-white px-2 py-1.5 my-[2px] transition-all hover:border-primary/50 hover:bg-surface-100"
      >
        <div class="flex w-8 justify-center">
          <n-button
            v-if="item?.isHaveChild"
            :loading="elementId === `${id}-${idx}`"
            @click="handleToggle(item, `${id}-${idx}`)"
            quaternary
            circle
            size="small"
            type="default"
            :disabled="elementId != null"
          >
            <template #icon>
              <n-icon size="16" class="text-primary">
                <ChevronRight16Filled
                  class="transition-transform duration-200"
                  :class="isExpanded(`${id}-${idx}`) && 'rotate-90'"
                />
              </n-icon>
            </template>
          </n-button>
          <div v-else class="w-8"></div>
        </div>

        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-semibold text-primary">{{ item.name }}</div>
          <div class="truncate text-xs text-textColor0/90">{{ item.fullName }}</div>
        </div>

        <UIMenuButton
          :data="item"
          :show-edit="true"
          :show-delete="true"
          :show-attachment="true"
          :loading="props.actionLoading && props.actionLoadingId === item.id"
          @selectEv="(ev) => onMenuSelect(item, idx, ev)"
        />
      </div>
    </div>
    <UITree
      v-if="isExpanded(`${id}-${idx}`)"
      :element-id="elementId"
      :action-loading="props.actionLoading"
      :action-loading-id="props.actionLoadingId"
      :expanded-keys="props.expandedKeys"
      :children="item.children"
      @on-load="onLoad"
      @on-change="onChange"
      @on-toggle="onToggle"
      :deep="deep + 1"
      :id="`${id}-${idx}`"
    ></UITree>
  </template>
</template>

<style scoped>
  .org-tree-lines :deep(.border__center-line) {
    overflow: visible;
  }

  .org-tree-lines :deep(.border__center-line::before) {
    width: 2px;
    background: var(--primary-color) !important;
    top: 0;
    bottom: -4px;
    height: auto;
  }

  .org-tree-lines :deep(.border__center-line:first-child::before) {
    background: transparent !important;
  }

  .org-tree-lines :deep(.border__center-content:first-child::before) {
    background: var(--primary-color) !important;
  }

  .org-tree-lines :deep(.line-half::before) {
    bottom: auto !important;
    height: 56% !important;
  }

  .org-tree-lines :deep(.border__center-content::after) {
    height: 2px;
    background: var(--primary-color) !important;
  }
</style>
