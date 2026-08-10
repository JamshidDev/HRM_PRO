<script setup>
  import { UISearchInput } from '@/components/index.js'
  import { useDashboardStore } from '@/store/modules/index.js'
  import { ArrowLeft20Filled } from '@vicons/fluent'
  import { useDebounce } from '@/utils/methods.js'
  import i18n from '@/i18n/index.js'
  import { auditCards } from './constants.js'

  const { t } = i18n.global
  const store = useDashboardStore()

  const activeCard = computed(() => auditCards.find((c) => c.type === store.audit.detail.type))
  const title = computed(() => (activeCard.value ? t(activeCard.value.title) : ''))

  // Ro'yxatni birinchi sahifadan qayta yuklaydi (qidiruv o'zgarganda).
  const filterEvent = () => {
    store.audit.detail.page = 1
    store._getAuditPreview()
  }

  // Har bosilgan harfda so'rov ketmasligi uchun (UIPageFilter'dagi kabi).
  const onSearch = useDebounce(filterEvent)
</script>

<template>
  <div class="flex items-center justify-between gap-3 flex-wrap">
    <div class="flex items-center gap-3">
      <n-button secondary strong @click="store.closeAuditDetail()">
        <template #icon>
          <n-icon :component="ArrowLeft20Filled" />
        </template>
        {{ $t('content.back') }}
      </n-button>
      <h2 class="text-2xl font-bold text-textColor0">{{ title }}</h2>
    </div>

    <!-- Kenglik inline style bilan: naive-ui `.n-input` ning o'z `width: 100%` i
         aks holda flex elementni butun qatorga cho'zib yuboradi. -->
    <UISearchInput
      v-model:value="store.params.search"
      style="width: 264px; flex: none"
      :loading="store.audit.detail.loading"
      @update:value="onSearch"
    />
  </div>
</template>
