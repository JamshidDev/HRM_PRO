<script setup>
  import { UIPageContent, UIModal } from '@/components/index.js'
  import TreeOrg from './ui/TreeOrg.vue'
  import Table from './ui/Table.vue'
  import ListItem from './ui/ListItem.vue'
  import createForm from './ui/createForm.vue'
  import Filter from './ui/Filter.vue'
  import CommentModal from './ui/CommentModal.vue'
  import { useAccountStore, useUploadReportStore } from '@/store/modules/index.js'
  import { getOneMonthAgoYearMonth } from '@utils'

  const store = useUploadReportStore()
  const accStore = useAccountStore()

  onMounted(() => {
    const oneMonthAgo = getOneMonthAgoYearMonth()
    store.params.year = oneMonthAgo.year
    store.params.month = oneMonthAgo.month
    if (!accStore.checkAction(accStore.pn.economistUploadsRead)) return
    if (store.structuresList.length === 0) {
      store._structures()
    }
  })
</script>

<template>
  <UIPageContent>
    <div class="w-full grid grid-cols-12">
      <div class="col-span-12 mb-4">
        <Filter />
      </div>
      <div class="col-span-12 lg:col-span-6">
        <TreeOrg />
      </div>
      <div class="col-span-12 lg:col-span-6 pl-2">
        <ListItem />
        <Table />
      </div>
      <div class="col-span-12">
        <UIModal
          :width="600"
          v-model:visible="store.visible"
          :title="
            store.visibleType ? $t('uploadReport.createTitle') : $t('uploadReport.updateTitle')
          "
        >
          <createForm />
        </UIModal>
        <CommentModal />
      </div>
    </div>
  </UIPageContent>
</template>
