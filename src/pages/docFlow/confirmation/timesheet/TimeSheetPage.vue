<script setup>
  import { UIConfirm, UIOfficeApp, UIPageContent } from '@/components/index.js'
  import { useConfTimesheetStore, useTimesheetWorkerStore } from '@/store/modules/index.js'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import Timesheet from '@/pages/hrm/timesheet/ui/Timesheet.vue'
  import Utils from '@/utils/Utils.js'
  import { useAccountStore } from '@/store/modules/index.js'
  const accStore = useAccountStore()

  const store = useConfTimesheetStore()
  const timesheetWorkerStore = useTimesheetWorkerStore()
  const officeAppRef = ref(null)

  const openOffice = (v) => {
    officeAppRef.value.openPdf(v.documentId, Utils.documentModels.timesheet, v.signatureId)
  }

  const onSignatureEv = () => {
    store._index()
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.confirmationTable)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table @openOffice="openOffice" />
    <UIOfficeApp ref="officeAppRef" @signatureEv="onSignatureEv" />

    <!-- To'ldirish ish maydoni — HR «Tabellar» sahifasidagi komponentning o'zi. -->
    <n-drawer height="100vh" v-model:show="timesheetWorkerStore.visible" placement="bottom">
      <Timesheet />
    </n-drawer>

    <UIConfirm
      v-model:visible="store.confirmVisible"
      type="confirm"
      :title="$t('timesheetPage.confirmWarning.title')"
      :message="$t('timesheetPage.confirmWarning.desc')"
      :confirm-text="$t('content.confirm')"
      :loading="store.saveLoading"
      @confirm="store._decide(3)"
    />

    <UIConfirm
      v-model:visible="store.rejectVisible"
      type="warning"
      danger
      :title="$t('timesheetPage.rejectWarning.title')"
      :message="$t('timesheetPage.rejectWarning.desc')"
      :confirm-text="$t('content.reject')"
      :loading="store.saveLoading"
      :confirm-disabled="!store.comment"
      @confirm="store._decide(4)"
    >
      <n-input v-model:value="store.comment" type="textarea" :rows="3" :placeholder="$t('content.comment')" />
    </UIConfirm>
  </UIPageContent>
</template>
