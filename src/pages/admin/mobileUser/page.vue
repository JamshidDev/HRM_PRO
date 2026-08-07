<script setup>
import { useMobileUserStore, useAccountStore } from '@/store/modules/index.js'
import { UIPageContent, UIPageFilter, UIModal } from '@/components/index.js'
import Table from './ui/Table.vue'
import Detail from './ui/Detail.vue'

const store = useMobileUserStore()
const accStore = useAccountStore()

const onSearch = (v) => {
  // Ilgari qo'pol `admin` edi; backend `mobile-users-read` ni enforce qiladi.
  if (!accStore.canView(accStore.pn.mobileUsers)) return
  store.params.search = v
  store._filterEvent()
}

onMounted(() => {
  // Ilgari qo'pol `admin` edi; backend `mobile-users-read` ni enforce qiladi.
  if (!accStore.canView(accStore.pn.mobileUsers)) return
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
