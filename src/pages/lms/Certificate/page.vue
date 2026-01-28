<script setup>
import {useAccountStore, useLmsCertificateStore} from "@stores"
import {UIOfficeApp, UIPageContent} from "@components"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import {eventBus, Events, Utils} from "@utils"


const store = useLmsCertificateStore()
const accStore = useAccountStore()

const officeAppRef = ref(null)

const openOffice = (id) => {
  officeAppRef.value.openPdf(id, Utils.documentModels.lmsCertificate)
}

const onUpdateStatus = (v)=>{
  const index = store.list.findIndex((x) => x.id === v.documentId)
  if (index === -1) return
  store.list[index].generate = 3
}

onMounted(()=>{
  eventBus.on(Events.CERTIFICATED_GENERATED, onUpdateStatus)
  if (!accStore.checkAction(accStore.pn.lmsCertificateRead)) return
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
