<script setup>
import {UIModal, UIPageContent} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import Table from "./ui/Table.vue"
import ViewSalary from "./ui/ViewSalary.vue"
import {useMonthReportStore} from "@/store/modules/index.js"


const store = useMonthReportStore()
const route = useRoute()


onMounted(()=>{
  const query = route.query
  store.params.year =query? query.year : new Date().getFullYear()
  store.params.month =query? Number(query.month) : new Date().getMonth()
  store.params.code =query? query.code : null
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
  </UIPageContent>
</template>