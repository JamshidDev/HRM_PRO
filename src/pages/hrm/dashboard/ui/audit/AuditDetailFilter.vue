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
  <!-- Kenglikni o'ram belgilaydi: naive-ui `.n-input` ning o'z `width: 100%` i
       inputni o'ram ichida to'ldiradi, flex elementni cho'zib yubormaydi.
       Tor ekranda (sm dan past) qidiruv butun qatorni oladi. -->
  <div class="w-full sm:w-[264px] shrink-0">
    <UISearchInput
      v-model:value="store.params.search"
      :loading="store.audit.detail.loading"
      @update:value="onSearch"
    />
  </div>
</template>
