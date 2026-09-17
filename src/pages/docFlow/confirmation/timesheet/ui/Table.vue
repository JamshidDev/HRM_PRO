<script setup>
  import { UIStatus, UITable } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useConfTimesheetStore, useTimesheetWorkerStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import {
    CalendarClock24Regular,
    CheckmarkCircle24Filled,
    DismissCircle24Filled,
    Eye16Regular
  } from '@vicons/fluent'
  import dayjs from 'dayjs'

  const { t } = i18n.global

  const store = useConfTimesheetStore()
  const timesheetWorkerStore = useTimesheetWorkerStore()

  const emits = defineEmits(['openOffice'])

  // Imzo qatori faqat men uchun keladi (`my_confirmation`), qaror kutilayotganda ko'rinadi.
  const isPending = (row) => row?.my_confirmation?.status === 1 || row?.my_confirmation?.status === 2
  const hasConfirmation = (row) => Boolean(row?.my_confirmation)

  const onPreview = (row) => {
    emits('openOffice', { documentId: row.id, signatureId: row?.my_confirmation?.id })
  }

  // To'ldirish oynasi — HR sahifasidagi ish maydonining AYNAN o'zi.
  // `organizationId` tozalanadi: aks holda HR sahifasidan qolgan (korxonaning
  // hamma bo'limi) filtr ro'yxati qayta yuklanmasdan qolib ketardi.
  const onFill = (row) => {
    timesheetWorkerStore.timekeeperMode = true
    timesheetWorkerStore.organizationId = null
    timesheetWorkerStore.params.page = 1
    timesheetWorkerStore.params.department_id = null
    timesheetWorkerStore.params.search = null
    timesheetWorkerStore.elementId = row.id
    timesheetWorkerStore.visible = true
    timesheetWorkerStore._index()
  }

  const onConfirm = (row) => {
    store.elementId = row.id
    store.confirmVisible = true
  }

  const onReject = (row) => {
    store.elementId = row.id
    store.comment = null
    store.rejectVisible = true
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'work_place',
      title: t('timesheetWorkerPage.work_place'),
      minWidth: 400
    },
    {
      key: 'month',
      title: t('content.month'),
      width: 160,
      align: 'center'
    },
    {
      key: 'status',
      title: t('timesheet.status'),
      width: 140,
      align: 'center'
    },
    {
      key: 'confirmation',
      title: t('content.status'),
      width: 140,
      align: 'center'
    }
  ])

  const actions = computed(() => [
    {
      label: t('timesheetPage.fill'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(CalendarClock24Regular),
      visible: (row) => Boolean(row?.can_fill),
      action: onFill
    },
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      visible: hasConfirmation,
      action: onPreview
    },
    {
      label: t('content.confirm'),
      key: Utils.ActionTypes.confirm,
      icon: UIHelper.renderIcon(CheckmarkCircle24Filled),
      visible: isPending,
      action: onConfirm
    },
    {
      label: t('content.reject'),
      key: Utils.ActionTypes.close,
      icon: UIHelper.renderIcon(DismissCircle24Filled),
      visible: isPending,
      action: onReject
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="docflow-confirmation-timesheet"
    @change-page="changePage"
  >
    <template #cell-work_place="{ row }">
      <div class="font-medium">
        {{ row?.work_place?.name || row?.department?.name }}
      </div>
    </template>

    <template #cell-month="{ row }">
      <div class="font-medium">
        {{
          dayjs()
            .year(row.year)
            .month(row.month - 1)
            .format('YYYY MMMM')
        }}
      </div>
    </template>

    <template #cell-status="{ row }">
      <n-button v-if="!!row?.status" type="primary" size="tiny" dashed>
        <template #icon>
          <n-icon :component="CheckmarkCircle24Filled" />
        </template>
        {{ $t('timesheet.finished') }}
      </n-button>
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus :status="row?.confirmation" />
    </template>
  </UITable>
</template>
