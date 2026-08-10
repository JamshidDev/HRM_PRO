<script setup>
  import { useKpiStore, useAccountStore } from '@stores'
  import { UIPageFilter } from '@/components/index.js'
  import { useDebounce } from '@/utils/index.js'

  const accStore = useAccountStore()
  const store = useKpiStore()

  const debounceIndexEv = useDebounce(store._index)

  // Qidiruv — F.I.Sh (backend PIN/tabelni ham shu orqali qamraydi).
  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.hrKpiRead)) return
    store.params.page = 1
    debounceIndexEv()
  }

  onUnmounted(() => {
    debounceIndexEv?.cancel()
  })
</script>

<template>
  <UIPageFilter
    :search-loading="store.loading"
    v-model:search="store.params.search"
    @onSearch="onSearch"
    :show-add-button="false"
    :show-filter-button="false"
  />
</template>
