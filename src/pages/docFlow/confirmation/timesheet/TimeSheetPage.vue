<script setup>
  import { UIDConfirm, UIOfficeApp, UIPageContent } from '@/components/index.js'
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

    <UIDConfirm v-model:visible="store.confirmVisible">
      <template #icon> <span></span></template>
      <div class="text-center pt-4">
        <p class="text-xl text-primary">{{ $t('timesheetPage.confirmWarning.title') }}</p>
        <p class="text-sm text-secondary">{{ $t('timesheetPage.confirmWarning.desc') }}</p>
      </div>
      <template #action>
        <div class="grid grid-cols-2 gap-2 select-none">
          <n-button @click="store.confirmVisible = false" secondary type="error">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button :loading="store.saveLoading" @click="store._decide(3)" secondary type="primary">
            {{ $t('content.confirm') }}
          </n-button>
        </div>
      </template>
    </UIDConfirm>

    <UIDConfirm v-model:visible="store.rejectVisible">
      <template #icon> <span></span></template>
      <div class="pt-4">
        <p class="text-xl text-warning text-center">
          {{ $t('timesheetPage.rejectWarning.title') }}
        </p>
        <p class="text-sm text-secondary text-center mb-3">
          {{ $t('timesheetPage.rejectWarning.desc') }}
        </p>
        <n-input
          v-model:value="store.comment"
          type="textarea"
          :rows="3"
          :placeholder="$t('content.comment')"
        />
      </div>
      <template #action>
        <div class="grid grid-cols-2 gap-2 select-none">
          <n-button @click="store.rejectVisible = false" secondary type="primary">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button
            :loading="store.saveLoading"
            :disabled="!store.comment"
            @click="store._decide(4)"
            secondary
            type="error"
          >
            {{ $t('content.reject') }}
          </n-button>
        </div>
      </template>
    </UIDConfirm>
  </UIPageContent>
</template>
