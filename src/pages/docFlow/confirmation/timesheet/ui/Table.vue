<script setup>
  import { UIStatus, UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useConfTimesheetStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Eye16Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useConfTimesheetStore()

  const emits = defineEmits(['openOffice'])

  const onOpenFile = (documentId, signatureId) => {
    emits('openOffice', { documentId, signatureId })
  }

  const onPreview = (row) => {
    onOpenFile(row?.timesheet.id, row.id)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'timesheet.user',
      title: t('content.worker'),
      minWidth: 280
    },
    {
      key: 'timesheet.work_place',
      title: t('timesheetWorkerPage.work_place'),
      minWidth: 200
    },
    {
      key: 'timesheet.month',
      title: t('content.month'),
      width: 120
    },
    {
      key: 'timesheet.year',
      title: t('content.year'),
      width: 120
    },
    {
      key: 'status',
      title: t('content.status'),
      width: 140
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onPreview
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
    <template #[`cell-timesheet.user`]="{ row }">
      <UIUser
        :data="{
          photo: row?.timesheet.user?.worker.photo,
          firstName: row?.timesheet.user?.worker.first_name,
          middleName: row?.timesheet.user?.worker.middle_name,
          lastName: row?.timesheet.user?.worker.last_name,
          position: row?.timesheet.user?.position || ' '
        }"
      />
    </template>

    <template #[`cell-timesheet.work_place`]="{ row }">
      <div class="font-medium">
        {{ row?.timesheet?.work_place?.name || row?.timesheet?.department?.name }}
      </div>
    </template>

    <template #[`cell-timesheet.month`]="{ row }">
      <div class="font-medium">{{ Utils.getMonthNameById(row?.timesheet?.month) }}</div>
    </template>

    <template #[`cell-timesheet.year`]="{ row }">
      <div class="font-medium">{{ row?.timesheet?.year }}</div>
    </template>

    <template #cell-status="{ row }">
      <UIStatus :status="row?.status" />
    </template>
  </UITable>
</template>
