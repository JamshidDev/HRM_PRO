<script setup>
  import { UIBadge, UIStatus, UITable, UIUser } from '@/components/index.js'
  import {
    useSickLeaveStore,
    useAccountStore,
    SICK_LEAVE_CLOSE_TYPE
  } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import {
    Eye16Regular,
    Delete20Regular,
    DocumentPdf24Regular,
    Edit32Regular,
    LockClosed20Filled
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useSickLeaveStore()
  const accStore = useAccountStore()

  const isOpen = (row) => !row.to_date

  const statusOf = (row) => {
    if (isOpen(row)) return { name: t('sickLeave.status.open'), id: 1 }
    if (row.close_type === SICK_LEAVE_CLOSE_TYPE.unexcused) {
      return { name: t('sickLeave.status.unexcused'), id: 4 }
    }
    return { name: t('sickLeave.status.closed'), id: 3 }
  }

  const onView = (row) => {
    store.viewRow = row
    store.viewVisible = true
  }

  const onEdit = (row) => {
    store._ensureWorkerOption({
      id: row.worker_position_id,
      name: [row.worker?.last_name, row.worker?.first_name, row.worker?.middle_name]
        .filter(Boolean)
        .join(' '),
      position: row.position
    })
    store.elementId = row.id
    store.visibleType = false
    store.payload.worker_position_id = row.worker_position_id
    store.payload.from_date = row.from_date
    store.visible = true
  }

  const onClose = (row) => {
    store.elementId = row.id
    store._resetClosePayload()
    store.closeFrom = row.from_date
    store.closeVisible = true
  }

  const onDelete = (row) => {
    store.elementId = row.id
    store.deleteVisible = true
  }

  const openFileNewTab = (url) => {
    window.open(url, '_blank')
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    { key: 'worker', title: t('sickLeave.table.worker'), minWidth: 240 },
    { key: 'status', title: t('sickLeave.table.status'), width: 150 },
    { key: 'organization.name', title: t('sickLeave.filter.organization'), minWidth: 220 },
    { key: 'from_date', title: t('sickLeave.table.fromDate'), width: 140 },
    { key: 'to_date', title: t('sickLeave.table.toDate'), width: 140 }
  ])

  // Ochiq varaqada: tahrirlash, yopish, o'chirish. Yopilganida faqat o'chirish
  // (u ham alohida ruxsat bilan — serverда tekshiriladi).
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
      visible: (row) => isOpen(row) && accStore.checkPermission(accStore.pn.hrSickLeaveWrite),
      action: onEdit
    },
    {
      label: t('sickLeave.actions.close'),
      key: Utils.ActionTypes.close,
      icon: UIHelper.renderIcon(LockClosed20Filled),
      visible: (row) => isOpen(row) && accStore.checkPermission(accStore.pn.hrSickLeaveClose),
      action: onClose
    },
    {
      label: t('content.download'),
      key: Utils.ActionTypes.download,
      icon: UIHelper.renderIcon(DocumentPdf24Regular),
      visible: (row) => !!row.file,
      action: (row) => openFileNewTab(row.file)
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      visible: () => accStore.checkPermission(accStore.pn.hrSickLeaveDelete),
      action: onDelete
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
    storage-key="hospital-sick-leave"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :data="{
          photo: null,
          firstName: row?.worker?.first_name,
          middleName: row?.worker?.middle_name,
          lastName: row?.worker?.last_name,
          position: row?.position
        }"
      />
    </template>

    <template #cell-status="{ row }">
      <UIStatus :status="statusOf(row)" />
    </template>

    <template #cell-from_date="{ row }">
      <UIBadge
        :show-icon="false"
        :type="Utils.colorTypes.dark"
        :label="Utils.timeOnlyDate(row.from_date)"
      />
    </template>

    <template #cell-to_date="{ row }">
      <UIBadge
        v-if="row.to_date"
        :show-icon="false"
        :type="Utils.colorTypes.dark"
        :label="Utils.timeOnlyDate(row.to_date)"
      />
    </template>
  </UITable>
</template>

<style scoped></style>
