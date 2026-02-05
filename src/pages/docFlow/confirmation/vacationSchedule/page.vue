<script setup>
  import { UIOfficeApp, UIPageContent } from '@components'
  import { useConfVacationScheduleStore } from '@stores'
  import { Table, Filter } from './ui'
  import { Utils } from '@utils'

  const store = useConfVacationScheduleStore()
  const officeAppRef = ref(null)

  onMounted(() => {
    store._index()
  })

  const openOffice = (id) => {
    officeAppRef.value.openPdf(id, Utils.documentModels.vacationSchedule)
  }
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table @openOffice="openOffice" />
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>
