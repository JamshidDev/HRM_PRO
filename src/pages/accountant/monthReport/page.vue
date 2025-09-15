<script setup>
import {UIModal, UIPageContent} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import Table from "./ui/Table.vue"
import ExportPanel from "./ui/ExportPanel.vue"
import ViewSalary from "./ui/ViewSalary.vue"
import {useAccountStore, useMonthReportStore} from "@/store/modules/index.js"


const store = useMonthReportStore()
const route = useRoute()
const accStore = useAccountStore()

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.economistStatementsRead)) return
  const query = route.query
  const isHasQuery = Object.keys(route.query).length>0
  store.params.year =isHasQuery? query.year : new Date().getFullYear()
  store.params.month =isHasQuery? Number(query.month) : new Date().getMonth()
  store.params.code =isHasQuery? query.code : null
  store._index()


})

</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table/>
    <UIModal
        :width="1000"
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType?$t('monthReport.createTitle') : $t('monthReport.updateTitle')"
    >
      <ViewSalary/>
    </UIModal>
    <UIModal
        :width="600"
        :visible="store.exportVisible"
        @update:visible="(v)=>store.exportVisible = v"
        :title="$t('monthReport.exportTitle')"
    >
      <ExportPanel/>
    </UIModal>
  </UIPageContent>
</template>