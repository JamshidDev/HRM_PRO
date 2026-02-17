<script setup>
import {
  useAccountStore, useNotificationStore
} from '@/store/modules/index.js'

import {UIPageFilter} from '@/components/index.js'
import {useDebounce} from '@/utils/index.js'

const accStore = useAccountStore()
const store = useNotificationStore()

const debounceIndexEv = useDebounce(store._index)

const filterEvent = () => {
  store.params.page = 1
  debounceIndexEv()
}

const onSearch = () => {
  if (!accStore.checkAction(accStore.pn.admin)) return
  filterEvent()
}

const onAdd = () => {
  if (!accStore.checkAction(accStore.pn.admin)) return
  store.resetForm()
  store.visible = true
}

</script>
<template>
  <UIPageFilter
      :show-filter-button="false"
      :search-loading="store.loading"
      v-model:search="store.params.search"
      @onSearch="onSearch"
      @onAdd="onAdd"
      :show-add-button="true"
  >
  </UIPageFilter>
</template>
