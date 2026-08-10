<script setup>
  import { UISearchInput } from '@/components/index.js'
  import { useDashboardStore } from '@/store/modules/index.js'
  import { useDebounce } from '@/utils/methods.js'

  const store = useDashboardStore()

  // Ro'yxatni birinchi sahifadan qayta yuklaydi (qidiruv o'zgarganda).
  const filterEvent = () => {
    store.audit.detail.page = 1
    store._getAuditPreview()
  }

  // Har bosilgan harfda so'rov ketmasligi uchun (UIPageFilter'dagi kabi).
  const onSearch = useDebounce(filterEvent)
</script>

<template>
  <!-- Kenglik inline style bilan: naive-ui `.n-input` ning o'z `width: 100%` i
       aks holda flex elementni butun qatorga cho'zib yuboradi. -->
  <UISearchInput
    v-model:value="store.params.search"
    style="width: 264px; flex: none"
    :loading="store.audit.detail.loading"
    @update:value="onSearch"
  />
</template>
