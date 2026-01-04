<script setup>
import {UIModal, UIPageContent} from '@components'
import {useAccountStore, useVacationScheduleStore} from '@stores'
import Table from './ui/Table.vue'
import {createForm} from './ui'
import Filter from './ui/Filter.vue'
import OtherList from './ui/OtherList.vue'

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
    <UIModal
        :width="1200"
        :visible="store.otherVisible"
        @update:visible="(v) => (store.otherVisible = v)"
        :title="$t('vacationSchedule.otherList.name')"
    >
      <OtherList/>
    </UIModal>
  </UIPageContent>
</template>

<style scoped></style>
