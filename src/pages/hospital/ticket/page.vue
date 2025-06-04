<script setup>
import {UIDrawer, UIOfficeApp, UIPageContent} from "@/components/index.js"
import {useTicketStore} from "@/store/modules/index.js"
import Filter from "./ui/Filter.vue"
import Table from "./ui/Table.vue"
import createForm from "./ui/createForm.vue"
import Utils from "@/utils/Utils.js"

const store = useTicketStore()
const officeAppRef = ref(null)



const openOffice = (id)=>{
  officeAppRef.value.openPdf(id, Utils.documentModels.med)
}


onMounted(()=>{
  store._index()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <Table @openEv="openOffice" />
  <UIOfficeApp ref="officeAppRef"/>
  <UIDrawer
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('ticket.createTitle') : $t('ticket.updateTitle')"
  >
    <template #content>
      <createForm/>
    </template>
  </UIDrawer>
</UIPageContent>
</template>

<style scoped>

</style>