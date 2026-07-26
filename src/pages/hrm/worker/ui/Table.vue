<script setup>
  import { UIUser, UIWorkerView, UITable } from '@/components/index.js'
  import {
    useTimesheetDepartmentStore,
    useWorkerStore,
    useExportStore,
    useAccountStore
  } from '@/store/modules/index.js'
  import { useRouter } from 'vue-router'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import { Edit32Regular, Eye16Regular, Table24Regular } from '@vicons/fluent'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const router = useRouter()
  const previewRef = ref(null)

  const store = useWorkerStore()
  const accStore = useAccountStore()
  const exportStore = useExportStore()
  const timesheetDepartmentStore = useTimesheetDepartmentStore()

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 260
    },
    {
      key: 'department.name',
      title: t('workerPage.table.department'),
      minWidth: 160
    },
    {
      key: 'position.name',
      title: t('workerPage.table.position'),
      minWidth: 160
    },
    {
      key: 'organization.name',
      title: t('workerPage.table.organization'),
      minWidth: 160
    },
    {
      key: 'group',
      title: t('workerPage.table.group'),
      fullTitle: t('workerPage.table.groupFull'),
      width: 64,
      align: 'center'
    },
    {
      key: 'rank',
      title: t('workerPage.table.rank'),
      fullTitle: t('workerPage.table.rankFull'),
      width: 64,
      align: 'center'
    },
    {
      key: 'rate',
      title: t('workerPage.table.rate'),
      fullTitle: t('workerPage.table.rateFull'),
      width: 64,
      align: 'center'
    }
  ])

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onPreview = (row) => {
    if (!accStore.checkAction(accStore.pn.hrWorkersRead)) return
    previewRef?.value.openPreview(row.uuid)
  }

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrWorkersWrite)) return
    router.push({
      path: `${AppPaths.Hrm}${AppPaths.WorkerProfile}`,
      query: { id: row.worker.uuid }
    })
  }

  const onAssignTimesheet = (row) => {
    if (!accStore.checkAction(accStore.pn.hrWorkersWrite)) return
    timesheetDepartmentStore.payload.worker_position_id = row.id
    timesheetDepartmentStore.visible = true
  }

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onPreview
    },
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    },
    {
      label: t('timesheet.assignUser'),
      key: Utils.ActionTypes.timesheet,
      icon: UIHelper.renderIcon(Table24Regular),
      action: onAssignTimesheet
    }
  ])
</script>

<template>
  <UIWorkerView ref="previewRef" />

  <UITable
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    :selectable="exportStore.isExportingResume"
    :selected-keys="exportStore.resumePayload.worker_ids"
    :all-selected="exportStore.resumePayload.all"
    storage-key="hrm-worker"
    @change-page="changePage"
    @toggle-row="exportStore.toggleResumeWorker"
    @toggle-all="exportStore.toggleAll"
  >
    <template #cell-worker="{ row }">
      <UIUser
        @onClickFullName="onPreview(row)"
        :short="false"
        :data="{
          photo: row?.worker.photo,
          firstName: row?.worker.first_name,
          middleName: row?.worker.middle_name,
          lastName: row?.worker.last_name,
          position: row?.type?.name
        }"
      />
    </template>

    <template #cell-group="{ row }">
      <n-button size="small" circle>{{ row?.group }}</n-button>
    </template>

    <template #cell-rank="{ row }">
      <n-button size="small" circle>{{ row?.rank }}</n-button>
    </template>

    <template #cell-rate="{ row }">
      <n-button size="small" circle>{{ row?.rate }}</n-button>
    </template>
  </UITable>
</template>
