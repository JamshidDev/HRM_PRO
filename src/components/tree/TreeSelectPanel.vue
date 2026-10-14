<script setup>
  // Daraxtli tanlash popover'ining umumiy qobig'i: tepada qidiruv, ostida
  // asboblar qatori (tanlanganlar soni, tozalash, qo'shimcha slot), keyin daraxt.
  // Qidiruv tepada — useTreePopoverKeyboard'da ↓ qidiruvdan daraxtga tushadi.
  import { Search20Regular, Search32Filled } from '@vicons/fluent'

  const props = defineProps({
    loading: { type: Boolean, default: false },
    // Daraxt qismining balandligi.
    bodyHeight: { type: String, default: 'min(400px, 55vh)' },
    selectedCount: { type: Number, default: 0 },
    // Ma'lumot yo'q — "topilmadi" holati ko'rsatiladi.
    empty: { type: Boolean, default: false },
    // Qidiruv input'i yashiriladi (masalan, trigger'ning o'zi qidiruv bo'lsa).
    hideSearch: { type: Boolean, default: false }
  })

  const search = defineModel('search', { type: String, default: null })
  const emits = defineEmits(['input', 'submit', 'clear'])

  const searchInputRef = ref(null)
  defineExpose({ focus: () => searchInputRef.value?.focus() })
</script>

<template>
  <div class="tsp">
    <div v-if="!hideSearch" class="tsp-head">
      <n-input
        ref="searchInputRef"
        data-tree-search
        clearable
        size="small"
        class="flex-1"
        v-model:value="search"
        :placeholder="$t('content.search')"
        @update:value="emits('input', $event)"
      >
        <template #prefix>
          <n-icon size="16" class="text-textColor3"><Search20Regular /></n-icon>
        </template>
      </n-input>
      <n-button type="primary" size="small" :loading="loading" @click="emits('submit')">
        <template #icon>
          <Search32Filled />
        </template>
      </n-button>
    </div>

    <div v-if="$slots.toolbar || selectedCount > 0" class="tsp-bar">
      <slot name="toolbar" />
      <span class="flex-1"></span>
      <template v-if="selectedCount > 0">
        <span class="tsp-selected">
          {{ $t('content.selected') }}: <b>{{ selectedCount }}</b>
        </span>
        <button type="button" class="tsp-link" @click="emits('clear')">
          {{ $t('content.clear') }}
        </button>
      </template>
    </div>

    <div class="tsp-body" :style="{ height: props.bodyHeight }">
      <n-spin :show="loading" class="w-full min-h-full">
        <div v-if="empty && !loading" class="tsp-empty">
          {{ $t('content.notFoundData') }}
        </div>
        <slot v-else />
      </n-spin>
    </div>
  </div>
</template>

<style scoped>
  .tsp {
    display: flex;
    flex-direction: column;
  }

  .tsp-head {
    display: flex;
    gap: 6px;
    padding: 10px 10px 8px;
  }

  .tsp-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 30px;
    padding: 0 12px 6px;
    font-size: 12px;
    color: var(--textColor2);
  }

  .tsp-selected b {
    color: var(--primary-color);
    font-weight: 600;
  }

  .tsp-link {
    font-weight: 500;
    color: var(--danger-color);
    border-radius: 4px;
    padding: 0 2px;
  }

  .tsp-link:hover {
    text-decoration: underline;
  }

  .tsp-body {
    overflow-y: auto;
    padding: 4px 6px 8px;
    border-top: 1px solid var(--surface-line);
  }

  .tsp-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    font-size: 13px;
    color: var(--textColor3);
  }
</style>
