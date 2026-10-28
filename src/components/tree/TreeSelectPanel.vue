<script setup>
  // Daraxtli tanlash popover'ining umumiy qobig'i: tepada qidiruv, ostida
  // asboblar qatori (tanlanganlar soni, tozalash, qo'shimcha slot), keyin daraxt.
  // Qidiruv tepada — useTreePopoverKeyboard'da ↓ qidiruvdan daraxtga tushadi.
  import { Dismiss12Regular, Search20Regular } from '@vicons/fluent'

  const props = defineProps({
    loading: { type: Boolean, default: false },
    // Daraxt qismining balandligi.
    bodyHeight: { type: String, default: 'min(400px, 55vh)' },
    selectedCount: { type: Number, default: 0 },
    // Ma'lumot yo'q — "topilmadi" holati ko'rsatiladi.
    empty: { type: Boolean, default: false },
    // Qidiruv input'i yashiriladi (masalan, trigger'ning o'zi qidiruv bo'lsa).
    hideSearch: { type: Boolean, default: false },
    // «N tanlandi» footeri — faqat ko'p tanlovda (joyi doim band, siljish yo'q).
    footer: { type: Boolean, default: true }
  })

  const search = defineModel('search', { type: String, default: null })
  const emits = defineEmits(['input', 'submit', 'clear'])

  const searchInputRef = ref(null)
  defineExpose({ focus: () => searchInputRef.value?.focus() })
</script>

<template>
  <div class="tsp">
    <div v-if="!hideSearch" class="tsp-head">
      <!-- Natija yozish davomida yangilanadi; Enter — tanlovni qo'llash. -->
      <n-input
        ref="searchInputRef"
        data-tree-search
        clearable
        round
        class="tsp-search"
        v-model:value="search"
        :loading="loading"
        :placeholder="$t('content.search')"
        @update:value="emits('input', $event)"
        @keyup.enter="emits('submit')"
      >
        <template #prefix>
          <n-icon size="16" class="text-textColor3"><Search20Regular /></n-icon>
        </template>
      </n-input>
      <!-- Qidiruv qatorining oxiri (masalan «Qisqa | To'liq»). -->
      <slot name="searchEnd" />
    </div>

    <div v-if="$slots.toolbar" class="tsp-bar">
      <slot name="toolbar" />
    </div>

    <div class="tsp-body" :style="{ height: props.bodyHeight }">
      <n-spin :show="loading" class="w-full min-h-full">
        <div v-if="empty && !loading" class="tsp-empty">
          {{ $t('content.notFoundData') }}
        </div>
        <slot v-else />
      </n-spin>
    </div>

    <!-- Footer joyi doim band — chip paydo bo'lganda daraxt siljimaydi. -->
    <div v-if="footer" class="tsp-foot">
      <transition name="tsp-chip">
        <span v-if="selectedCount > 0" class="tsp-chip">
          <b>{{ selectedCount }}</b>
          <span>{{ $t('content.selected').toLocaleLowerCase() }}</span>
          <button
            type="button"
            class="tsp-chip__x"
            :title="$t('content.clear')"
            :aria-label="$t('content.clear')"
            @click="emits('clear')"
          >
            <n-icon size="12"><Dismiss12Regular /></n-icon>
          </button>
        </span>
      </transition>
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
    align-items: center;
    gap: 8px;
    padding: 10px 10px 6px;
  }

  .tsp-search {
    flex: 1;
    --n-height: 34px !important;
    --n-color: var(--surface-ground) !important;
    --n-border: 1px solid transparent !important;
  }

  .tsp-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px 4px;
    font-size: 12px;
    color: var(--textColor2);
  }

  .tsp-foot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 34px;
    flex-shrink: 0;
    padding: 0 10px;
  }

  .tsp-chip-enter-active,
  .tsp-chip-leave-active {
    transition:
      opacity 0.16s ease,
      transform 0.16s ease;
  }

  .tsp-chip-enter-from,
  .tsp-chip-leave-to {
    opacity: 0;
    transform: translateY(3px);
  }

  .tsp-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 22px;
    padding: 0 3px 0 9px;
    border-radius: 9999px;
    font-size: 12px;
    color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  }

  .tsp-chip b {
    font-weight: 600;
  }

  .tsp-chip__x {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 9999px;
    color: inherit;
    transition: background-color 0.12s ease;
  }

  .tsp-chip__x:hover {
    background: color-mix(in srgb, var(--primary-color) 18%, transparent);
  }

  .tsp-body {
    overflow-y: auto;
    padding: 2px 6px 8px;
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
