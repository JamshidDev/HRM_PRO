<script setup>
import {UIModal, UIPageContent} from '@components'
import {useAccountStore, useVacationScheduleStore} from '@stores'
import {createForm, Filter, Table} from './ui'

const store = useVacationScheduleStore()
const accStore = useAccountStore()

onMounted(() => {
  if (!accStore.checkAction(accStore.pn.hrVacationScheduleRead)) return
  store._index()
})
</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table/>
    <UIModal
        width="90%"
        v-model:visible="store.visible"
        :title="store.visibleType ? $t('vacationSchedule.createTitle') : $t('vacationSchedule.updateTitle')"
    >
      <createForm/>
    </UIModal>
  </UIPageContent>
</template>
