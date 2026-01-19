<script setup>
import {UIModal, UIOfficeApp, UIPageContent} from '@components'
import {useAccountStore, useVacationScheduleStore} from '@stores'
import {createForm, Filter, Table} from './ui'
import {Utils} from "@utils"

const store = useVacationScheduleStore()
const accStore = useAccountStore()
const officeAppRef = ref(null)

const openOffice = (id) => {
  officeAppRef.value.openPdf(id, Utils.documentModels.vacationSchedule)
}

onMounted(() => {
  if (!accStore.checkAction(accStore.pn.hrVacationScheduleRead)) return
  store._index()
})
</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table @openOffice="openOffice"/>
    <UIModal
        width="90%"
        v-model:visible="store.visible"
        :title="store.visibleType ? $t('vacationSchedule.createTitle') : $t('vacationSchedule.updateTitle')"
    >
      <createForm/>
    </UIModal>
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>
