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
    Edit32Regular,
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
    if (!accStore.checkAction(accStore.pn.hrTableWorkersWrite)) return
    store.elementId = row.id
    store.payload.department_id = row.department?.id
    store.payload.work_place_id = row.work_place?.id
    store.payload.active_tab = row.department?.id ? 'department' : 'organization'
    store.payload.timestamp = dayjs()
      .month(row.month - 1)
      .year(row.year)
      .valueOf()
    store.visibleType = false
    store.visible = true
  }

  const onVerifier = (row) => {
    if (!accStore.checkAction(accStore.pn.hrTableWorkersWrite)) return
    timesheetConfirmStore.elementId = row.id
    timesheetConfirmStore.visible = true
  }

  const onFinish = (row) => {
    if (row.status) return
    if (!accStore.checkAction(accStore.pn.hrTableWorkersWrite)) return
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
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-table-workers"
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
