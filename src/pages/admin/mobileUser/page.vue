<script setup>
import { useMobileUserStore, useAccountStore } from '@/store/modules/index.js'
import { UIPageContent, UIPageFilter, UIModal } from '@/components/index.js'
import Table from './ui/Table.vue'
import Detail from './ui/Detail.vue'

const store = useMobileUserStore()
const accStore = useAccountStore()

const onSearch = (v) => {
  if (!accStore.checkAction(accStore.pn.admin)) return
  store.params.search = v
  store._filterEvent()
}

onMounted(() => {
  if (!accStore.checkAction(accStore.pn.admin)) return
  store._index()
})
</script>

<template>
  <UIPageContent>
    <UIPageFilter :show-add-button="false" :show-filter-button="false" @on-search="onSearch" />
    <Table />
    <UIModal
      v-model:visible="store.detailVisible"
      :width="700"
      :title="$t('mobileUserPage.detailTitle')"
    >
      <div class="max-h-[70vh] overflow-y-auto">
        <Detail />
      </div>
    </UIModal>
  </UIPageContent>
</template>
