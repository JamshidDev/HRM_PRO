<script setup>
import {useAccountStore, useConfCertificateStore} from "@stores"
import {UIOfficeApp, UIPageContent} from "@components"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import {eventBus, Events, Utils} from "@utils"


const store = useConfCertificateStore()
const accStore = useAccountStore()

const officeAppRef = ref(null)

const openOffice = (v) => {
  officeAppRef.value.openPdf( v.documentId, Utils.documentModels.lmsCertificate, v.signatureId)
}

const onUpdateStatus = (v)=>{
  const index = store.list.findIndex((x) => x.id === v.documentId)
  if (index === 1) return
  store.list[index].generate = 3
}

onMounted(()=>{
  eventBus.on(Events.CERTIFICATED_GENERATED, onUpdateStatus)
  if (!accStore.checkAction(accStore.pn.confirmationLmsCertificateRead)) return
  store._index()
})

onUnmounted(()=>{
  eventBus.off(Events.CERTIFICATED_GENERATED, onUpdateStatus)
})
</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table @openOffice="openOffice"/>
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>
