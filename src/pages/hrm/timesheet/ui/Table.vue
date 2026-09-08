<script setup>
  import { UIStatus, UITable } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import {
    useAccountStore,
    useTimesheetConfirmStore,
    useTimesheetStore,
    useTimesheetWorkerStore
  } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import {
    CalendarCheckmark28Filled,
    Checkmark16Filled,
    CheckmarkCircle24Filled,
    Delete16Regular,
    Edit32Regular,
    Send24Regular,
    Eye16Regular
  } from '@vicons/fluent'
  import dayjs from 'dayjs'

  const { t } = i18n.global

  const store = useTimesheetStore()
  const accStore = useAccountStore()
  const timesheetWorkerStore = useTimesheetWorkerStore()
  const timesheetConfirmStore = useTimesheetConfirmStore()

  const onView = (row) => {
    timesheetWorkerStore.elementId = row.id
    timesheetWorkerStore.visible = true
    timesheetWorkerStore._index()
  }

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrTableWrite)) return
    store.elementId = row.id
    store.setOrganization(row.work_place ? [row.work_place] : [])
    store.payload.year = row.year
    store.payload.month = row.month
    store.visibleType = false
    store.visible = true
  }

  const onVerifier = (row) => {
    if (!accStore.checkAction(accStore.pn.hrTableWrite)) return
    timesheetConfirmStore.elementId = row.id
    timesheetConfirmStore.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrTableDelete)) return
    store.elementId = row.id
    store._delete()
  }

  // Ogohlantirish aniq bo'lishi kerak: hujjat bilan birga o'sha oyning
  // to'ldirilgan kunlari ham o'chadi.
  const deleteWarning = (row) =>
    row?.workers_count
      ? t('timesheetPage.deleteWarning.filled', {
          month: dayjs()
            .year(row.year)
            .month(row.month - 1)
            .format('YYYY MMMM'),
          count: row.workers_count
        })
      : t('timesheetPage.deleteWarning.empty')

  // Yuborilgan (va hali rad etilmagan) tabel qayta yuborilmaydi.
  const isSent = (row) => Boolean(row?.sent_at) && row?.confirmation?.id !== 4
  const isConfirmed = (row) => row?.confirmation?.id === 3 || Boolean(row?.status)

  const onSend = (row) => {
    if (!accStore.checkAction(accStore.pn.hrTableWrite)) return
    if (isSent(row) || isConfirmed(row)) return
    store.elementId = row.id
    store.sendVisible = true
  }

  const onFinish = (row) => {
    if (row.status) return
    if (!accStore.checkAction(accStore.pn.hrTableWrite)) return
    store.warningVisible = true
    store.elementId = row.id
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
      minWidth: 500,
    },
    {
      key: 'month',
      title: t('content.month'),
      width: 140,
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
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onView
    },
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    },
    {
      label: t('timesheetPage.verifiers'),
      key: Utils.ActionTypes.verifier,
      icon: UIHelper.renderIcon(Checkmark16Filled),
      action: onVerifier
    },
    {
      label: t('content.finish'),
      key: Utils.ActionTypes.finish,
      icon: UIHelper.renderIcon(CalendarCheckmark28Filled),
      action: onFinish
    },
    {
      label: t('timesheetPage.send'),
      key: Utils.ActionTypes.send,
      icon: UIHelper.renderIcon(Send24Regular),
      visible: (row) => !isSent(row) && !isConfirmed(row),
      action: onSend
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete16Regular),
      visible: (row) => !isConfirmed(row),
      action: onDelete
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-table"
    :delete-warning="deleteWarning"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-timesheet-department"
    @change-page="changePage"
  >
    <template #cell-work_place="{ row }">
      {{ row.department?.name || row.work_place?.name }}
    </template>

    <template #cell-month="{ row }">
      {{
        dayjs()
          .year(row.year)
          .month(row.month - 1)
          .format('YYYY MMMM')
      }}
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
      <UIStatus :status="row.confirmation" />
    </template>
  </UITable>
</template>
