<script setup>
  import { UIBadge, UITable } from '@/components/index.js'
  import { useScheduleGroupWorkerStore, useShiftTypeStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import {
    CheckmarkCircle32Regular,
    Delete20Regular,
    Eye16Regular,
    OpenFolder24Filled
  } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useShiftTypeStore()
  const scheduleGroupworkerStore = useScheduleGroupWorkerStore()

  const changePage = (v) => {
    store.groupParams.page = v.page
    store.groupParams.per_page = v.per_page
    store._group()
  }

  const onViewWorkers = (row) => {
    store.elementId = row.id
    store.groupId = row.id
    scheduleGroupworkerStore.params.group = row.id
    scheduleGroupworkerStore.params.startDate = row.start_date
    scheduleGroupworkerStore.params.endDate = row.end_date
    store.activeTab = 3
  }

  const onEdit = (row) => {
    store.elementId = row.id
    store.groupId = row.id
    store.generatePayload.name = row.name
    store.generatePayload.start_date = Utils.datePickerFormatter(row.start_date)
    store.generatePayload.end_date = Utils.datePickerFormatter(row.end_date)
    store.isDailySchedule = false
    store.visibleType = false
    store.visible = true
  }

  const onDelete = (row) => {
    store.elementId = row.id
    store.groupId = row.id
    store._deleteGroup()
  }

  const onAttachWorker = (row) => {
    store.groupId = row.id
    store.elementId = row.schedule_type?.id
    store.notScheduleParams.start_date = row.start_date
    store.notScheduleParams.end_date = row.end_date
    store.notScheduleParams.page = 1
    store._notScheduleWorker()
    store.selectedWorkers = []
    store.notScheduleVisible = true
  }

  const columns = computed(() => [
    {
      key: 'name',
      title: t('content.name'),
      minWidth: 260
    },
    {
      key: 'workers_count',
      title: t('content.worker'),
      width: 200
    },
    {
      key: 'start_date',
      title: t('content.from'),
      width: 160
    },
    {
      key: 'end_date',
      title: t('content.to'),
      width: 160
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.attachment'),
      key: Utils.ActionTypes.attachment,
      icon: UIHelper.renderIcon(OpenFolder24Filled),
      action: onAttachWorker,
      visible: (row) => row?.schedule_type?.type?.id === 2
    },
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onViewWorkers
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    },
    {
      label: t('content.finish'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(CheckmarkCircle32Regular),
      action: onEdit
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :actions="actions"
    :data="store.groupList"
    :loading="store.groupLoading"
    :page="store.groupParams.page"
    :per-page="store.groupParams.per_page"
    :total="store.totalGroup"
    storage-key="turnstile-schedule-group"
    @change-page="changePage"
  >
    <template #cell-name="{ row }">
      <div @click="onViewWorkers(row)" class="cursor-pointer">
        <div class="hover:text-primary leading-[1.2] font-medium">
          {{ row.name }}
        </div>
        <div class="hover:text-primary line-clamp-1 text-xs text-secondary">
          <n-button class="!h-[16px] !font-medium" size="tiny" type="primary" secondary>
            {{ row.schedule_type?.type?.name }}
          </n-button>
          {{ row.schedule_type?.name }}
        </div>
      </div>
    </template>

    <template #cell-workers_count="{ row }">
      <UIBadge :show-icon="false" :label="String(row.workers_count)" />
    </template>

    <template #cell-start_date="{ row }">
      <UIBadge :show-icon="false" :label="row.start_date" />
    </template>

    <template #cell-end_date="{ row }">
      <UIBadge :show-icon="false" :label="row.end_date" />
    </template>
  </UITable>
</template>
