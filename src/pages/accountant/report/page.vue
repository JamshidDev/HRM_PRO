<script setup>
  import { UIPageContent, UIModal } from '@/components/index.js'
  import TreeOrg from './ui/TreeOrg.vue'
  import Table from './ui/Table.vue'
  import ListItem from './ui/ListItem.vue'
  import createForm from './ui/createForm.vue'
  import Filter from './ui/Filter.vue'
  import BulkConfirmBar from './ui/BulkConfirmBar.vue'
  import CommentModal from './ui/CommentModal.vue'
  import BulkOnesModal from './ui/BulkOnesModal.vue'
  import ReportStatusModal from './ui/ReportStatusModal.vue'
  import ReportPullHistoryModal from './ui/ReportPullHistoryModal.vue'
  import { useAccountStore, useUploadReportStore } from '@/store/modules/index.js'
  import { getOneMonthAgoYearMonth } from '@utils'
  import { useElementBounding, useMediaQuery, useResizeObserver, useWindowSize } from '@vueuse/core'

  const store = useUploadReportStore()
  const accStore = useAccountStore()

  // Jadval va o'ng panel sahifa pastigacha cho'zilishi uchun balandlik
  // blokning haqiqiy joylashuvidan hisoblanadi (Filter/BulkConfirmBar balandligi o'zgaruvchan).
  const headerRef = ref(null)
  const bodyRef = ref(null)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const { height: windowHeight } = useWindowSize()
  const { top: bodyTop, update: updateBodyTop } = useElementBounding(bodyRef)
  useResizeObserver(headerRef, () => updateBodyTop())
  const bodyStyle = computed(() =>
    isDesktop.value ? { height: `${Math.max(480, windowHeight.value - bodyTop.value - 16)}px` } : {}
  )

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
    <div class="w-full flex flex-col">
      <div ref="headerRef">
        <div class="mb-4">
          <Filter />
        </div>
        <BulkConfirmBar />
      </div>
      <div ref="bodyRef" :style="bodyStyle" class="grid grid-cols-12 gap-3">
        <div class="col-span-12 lg:col-span-6 h-[70vh] lg:h-full min-h-0">
          <TreeOrg />
        </div>
        <div class="col-span-12 lg:col-span-6 flex flex-col lg:h-full min-h-0">
          <ListItem />
          <Table />
        </div>
      </div>
      <div>
        <UIModal
          :width="600"
          v-model:visible="store.visible"
          :title="
            store.visibleType ? $t('uploadReport.createTitle') : $t('uploadReport.updateTitle')
          "
        >
          <createForm />
        </UIModal>
        <BulkOnesModal />
        <ReportStatusModal />
        <ReportPullHistoryModal />
        <CommentModal />
      </div>
    </div>
  </UIPageContent>
</template>
