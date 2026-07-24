<script setup>
  import { UIPagination, UIUser, UIWorkerView, UITable, UITableCard } from '@/components/index.js'
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

  const store = useWorkerStore()
  const accStore = useAccountStore()
  const exportStore = useExportStore()

  const timesheetDepartmentStore = useTimesheetDepartmentStore()
  const { t } = i18n.global

  const router = useRouter()
  const previewRef = ref(null)

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onPreview = (uuid) => {
    if (!accStore.checkAction(accStore.pn.hrWorkersRead)) return
    previewRef.value.openPreview(uuid)
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

  const actions = [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: (row) => onPreview(row.uuid)
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
  ]

  const onSelectEv = (key, row) => {
    if (!accStore.checkAction(accStore.pn.hrWorkersRead)) return
    actions.find((a) => a.key === key)?.action(row)
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 260
    },
    {
      key: 'department',
      title: t('workerPage.table.department'),
      minWidth: 160
    },
    {
      key: 'position',
      title: t('workerPage.table.position'),
      minWidth: 160
    },
    {
      key: 'organization',
      title: t('workerPage.table.organization'),
      minWidth: 160
    },
    {
      key: 'group',
      title: t('workerPage.table.group'),
      width: 64,
      align: 'center'
    },
    {
      key: 'rank',
      title: t('workerPage.table.rank'),
      width: 64,
      align: 'center'
    },
    {
      key: 'rate',
      title: t('workerPage.table.rate'),
      width: 64,
      align: 'center'
    }
  ])
</script>

<template>
  <UIWorkerView ref="previewRef" />

  <div class="w-full mt-4">
    <UITableCard :loading="store.loading" :empty="store.list.length === 0">
      <template #default>
        <UITable
          :columns="columns"
          :actions="actions"
          :data="store.list"
          :page="store.params.page"
          :per-page="store.params.per_page"
          :selectable="exportStore.isExportingResume"
          :selected-keys="exportStore.resumePayload.worker_ids"
          :all-selected="exportStore.resumePayload.all"
          storage-key="hrm-worker"
          @action="onSelectEv"
          @toggle-row="exportStore.toggleResumeWorker"
          @toggle-all="exportStore.toggleAll"
        >
          <template #cell-worker="{ row }">
            <UIUser
              @onClickFullName="onPreview(row.uuid)"
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

          <template #cell-department="{ row }">{{ row?.department?.name }}</template>
          <template #cell-position="{ row }">{{ row?.position?.name }}</template>
          <template #cell-organization="{ row }">{{ row?.organization?.name }}</template>

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

      <template #footer>
        <UIPagination
          :page="store.params.page"
          :per_page="store.params.per_page"
          :total="store.totalItems"
          @change-page="changePage"
        />
      </template>
    </UITableCard>
  </div>
</template>
