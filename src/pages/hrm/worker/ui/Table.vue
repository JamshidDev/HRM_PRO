<script setup>
  import { UIGender, UIPhoneNumber, UITable, UIUser, UIWorkerView } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useExportStore,
    useTimesheetDepartmentStore,
    useWorkerStore
  } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Edit32Regular, Eye16Regular, Table24Regular } from '@vicons/fluent'
  import { useRouter } from 'vue-router'

  const { t } = i18n.global

  const router = useRouter()
  const previewRef = ref(null)

  const store = useWorkerStore()
  const accStore = useAccountStore()
  const exportStore = useExportStore()
  const timesheetDepartmentStore = useTimesheetDepartmentStore()
  const componentStore = useComponentStore()

  onMounted(() => {
    if (componentStore.maritalList.length === 0) componentStore._enums()
  })

  const maritalStatusName = (id) => componentStore.maritalList.find((v) => v.id === id)?.name ?? '-'

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

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 280
    },
    {
      key: 'department.name',
      title: t('workerPage.table.department'),
      minWidth: 200
    },
    {
      key: 'position.name',
      title: t('workerPage.table.position'),
      minWidth: 200
    },
    {
      key: 'organization.name',
      title: t('workerPage.table.organization'),
      minWidth: 200
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
    },
    {
      key: 'type.name',
      title: t('workerPage.filter.position_type'),
      minWidth: 140,
      visible: false
    },
    {
      key: 'position_date',
      title: t('workerPage.table.position_date'),
      minWidth: 140,
      visible: false
    },
    {
      key: 'salary',
      title: t('workerPage.table.salary'),
      minWidth: 140,
      visible: false
    },
    {
      key: 'worker.birthday',
      title: t('workerPage.table.birthday'),
      minWidth: 140,
      visible: false
    },
    {
      key: 'worker.pin',
      title: t('createWorkerPage.form.pin'),
      minWidth: 160,
      visible: false
    },
    {
      key: 'worker.sex',
      title: t('createWorkerPage.form.sex'),
      minWidth: 100,
      visible: false
    },
    {
      key: 'worker.marital_status',
      title: t('createWorkerPage.form.marital_status'),
      minWidth: 200,
      ellipsis: {
        tooltip: true
      },
      visible: false
    },
    {
      key: 'worker.work_experience',
      title: t('workerPage.table.workExperience'),
      minWidth: 100,
      visible: false
    },
    {
      key: 'worker.address',
      title: t('createWorkerPage.form.address'),
      minWidth: 260,
      visible: false
    },
    {
      key: 'worker.nationality.name',
      title: t('createWorkerPage.form.nationality_id'),
      minWidth: 100,
      visible: false
    },
    {
      key: 'worker.region.name',
      title: t('createWorkerPage.form.region'),
      minWidth: 140,
      visible: false
    },
    {
      key: 'worker.city.name',
      title: t('createWorkerPage.form.city'),
      minWidth: 140,
      visible: false
    },
    {
      key: 'worker.current_region.name',
      title: t('createWorkerPage.form.currentRegion'),
      minWidth: 140,
      visible: false
    },
    {
      key: 'worker.current_city.name',
      title: t('createWorkerPage.form.currentCity'),
      minWidth: 140,
      visible: false
    },
    {
      key: 'worker.phones',
      title: t('content.phone'),
      minWidth: 140,
      visible: false
    },
    {
      key: 'worker.passport.serial_number',
      title: t('createWorkerPage.form.serial_number'),
      minWidth: 140,
      visible: false
    },
    {
      key: 'worker.passport.from_date',
      title: t('createWorkerPage.form.from_date'),
      minWidth: 140,
      visible: false
    },
    {
      key: 'worker.passport.to_date',
      title: t('createWorkerPage.form.to_date'),
      minWidth: 160,
      visible: false
    },
    {
      key: 'worker.passport.address',
      title: t('createWorkerPage.form.passport_address'),
      minWidth: 260,
      visible: false
    }
  ])

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

    <template #[`cell-position_date`]="{ row }">
      {{ Utils.timeOnlyDate(row?.position_date) }}
    </template>

    <template #[`cell-salary`]="{ row }">
      {{ Utils.formatNumberToMoney(row?.salary) }}
    </template>

    <template #[`cell-worker.birthday`]="{ row }">
      {{ Utils.timeOnlyDate(row?.worker?.birthday) }}
    </template>

    <template #[`cell-worker.sex`]="{ row }">
      <UIGender :sex="row?.worker?.sex" />
    </template>

    <template #[`cell-worker.marital_status`]="{ row }">
      {{ maritalStatusName(row?.worker?.marital_status) }}
    </template>

    <template #[`cell-worker.phones`]="{ row }">
      <UIPhoneNumber :phone="row?.worker?.phones?.[0]?.phone" />
    </template>

    <template #[`cell-worker.passport.from_date`]="{ row }">
      {{ Utils.timeOnlyDate(row?.worker?.passport?.from_date) }}
    </template>

    <template #[`cell-worker.passport.to_date`]="{ row }">
      {{ Utils.timeOnlyDate(row?.worker?.passport?.to_date) }}
    </template>
  </UITable>
</template>
