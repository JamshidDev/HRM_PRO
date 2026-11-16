<script setup>
  // Ta'tillar grafigi — hujjatsiz: ro'yxat, sarlavha formasi va grafik ichi (drawer).
  import { UIModal, UIPageContent } from '@components'
  import { useAccountStore, useVacationScheduleStore } from '@stores'
  import { createForm, Filter, ScheduleDrawer, Table } from './ui'

  const store = useVacationScheduleStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrVacationScheduleRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIModal
      width="640px"
      v-model:visible="store.visible"
      :title="
        store.visibleType ? $t('vacationSchedule.createTitle') : $t('vacationSchedule.updateTitle')
      "
    >
      <createForm />
    </UIModal>
    <ScheduleDrawer />
  </UIPageContent>
</template>
