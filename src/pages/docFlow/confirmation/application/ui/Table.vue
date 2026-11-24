<script setup>
  import {
    UIStatus,
    UITable,
    UITableBadgeCell,
    UITableNameCell,
    UIUser,
    UIElectronicNumber
  } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useConfApplicationStore
  } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { Delete20Regular, Edit32Regular, Eye16Regular } from '@vicons/fluent'
  import i18n from '@/i18n'

  const store = useConfApplicationStore()
  const componentStore = useComponentStore()
  const accountStore = useAccountStore()
  const t = i18n.global.t

  const DRAFT_CONFIRMATION = 6

  // Tahrir va o'chirish — faqat o'z arizasi va faqat Qoralama (backend bilan bir xil qoida).
  const isOwnDraft = (row) => {
    const app = row?.worker_application
    return (
      app?.worker?.id === accountStore.account?.worker?.id &&
      Number(app?.status) === 0 &&
      app?.confirmation?.id === DRAFT_CONFIRMATION
    )
  }
  const canEdit = isOwnDraft
  const canDelete = isOwnDraft

  // Ariza holati 6 = Qoralama; UIStatus'da 6 «Active» (yashil) — neytral ko'rinishga almashtiramiz.
  const emits = defineEmits(['openOffice'])

  const editResponse = (v) => {
    // Tavsifli tur maydonlari (bo'lmasa — eski ariza).
    store.payload.data = v.data && typeof v.data === 'object' ? { ...v.data } : {}
    store.payload.director_id = v.director_id
    store.payload.worker_position_id = v.worker_position_id
    store.payload.type = v.type
    store.payload.confirmations = v.confirmations
    store.payload.period_from = Utils.datePickerFormatter(v.period_from)
    store.payload.period_to = Utils.datePickerFormatter(v.period_to)
    store.payload.from = Utils.datePickerFormatter(v.from)
    store.payload.to = Utils.datePickerFormatter(v.to)
    store.payload.from_date = Utils.datePickerFormatter(v.from_date)
    store.payload.from_time = Utils.timePickerFormatter(v.from_time)
    store.payload.to_time = Utils.timePickerFormatter(v.to_time)
    store.payload.contract_to_date = Utils.datePickerFormatter(v.contract_to_date)
    store.payload.univer_date = Utils.datePickerFormatter(v.univer_date)
    store.payload.application_date = Utils.datePickerFormatter(v.application_date)
    store.payload.reason = v.reason
    // Select qiymati son — backend JSON'idan "0.5" satr kelishi mumkin.
    store.payload.rate = v.rate != null && v.rate !== '' ? Number(v.rate) : 1
    store.payload.department_position_id = v.department_position_id
    store.payload.temporarily_absent = v.temporarily_absent
    store.payload.education_type = v.education_type
    store.payload.univer_number = v.univer_number
    store.organization_id = v?.organization_id
    store.department_id = v?.department_id
    store.confirmParams.organization_id = v.organization_id?.at(0)?.id || undefined
    store._myPositions()
    if (store.department_id?.length) {
      store._allPositions(store.department_id.at(0)?.id || undefined)
    }

    if (v.type === 6) {
      componentStore._departmentPosition(store.department_id.at(0)?.id || undefined)
    }
  }

  const onOpenFile = (documentId, signatureId) => {
    emits('openOffice', { documentId, signatureId })
  }

  const onPreview = (row) => {
    onOpenFile(row?.worker_application?.id, row.id)
  }

  const onEdit = (row) => {
    store.visibleType = false
    store.elementId = row.worker_application?.id
    store.visible = true
    store.activeTab = 101
    store.stepNumber = 1
    store._getEdit(editResponse)
  }

  const onDelete = (row) => {
    store.elementId = row?.worker_application?.id
    store._confDelete()
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // Kelishuvchi rad etgan ariza.
  const REJECTED_CONFIRMATION = 4

  // Bitta holat: Qoralama → Tekshiruvda (HR) → Jarayonda (kelishuvchilar) → Tasdiqlangan / Rad etilgan.
  const appStatus = (app) => {
    const conf = app?.confirmation?.id
    const hr = Number(app?.status)
    // HR tuzatish uchun qaytargan qoralama.
    if (conf === DRAFT_CONFIRMATION && app?.returned)
      return { id: 11, name: t('applicationPage.statuses.returned') }
    if (conf === DRAFT_CONFIRMATION) return { id: 2, name: t('applicationPage.statuses.draft') }
    if (conf === 3) return { id: 3, name: t('applicationPage.statuses.approved') }
    if (conf === REJECTED_CONFIRMATION || hr === 2)
      return { id: 4, name: t('applicationPage.statuses.rejected') }
    if (hr === 1) return { id: 1, name: t('applicationPage.statuses.process') }
    return { id: 9, name: t('applicationPage.statuses.checking') }
  }

  const columns = computed(() => [
    {
      key: 'worker_application.type.name',
      title: t('applicationPage.form.type'),
      minWidth: 200
    },
    {
      key: 'worker_application.number',
      title: t('applicationPage.form.number'),
      width: 100,
      align: 'center'
    },
    {
      key: 'worker_application.electronic_number',
      title: t('documentSettings.electronicNumber'),
      width: 130
    },
    {
      key: 'worker_application.worker',
      title: t('content.worker'),
      minWidth: 200
    },
    {
      key: 'worker_application.confirmation',
      title: t('content.status'),
      width: 120
    },
    {
      key: 'worker_application.generate',
      title: t('content.document'),
      width: 120
    },
    {
      key: 'worker_application.created_at',
      title: t('content.date'),
      width: 120
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
      visible: canEdit,
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      visible: canDelete,
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
    storage-key="docflow-confirmation-application"
    @change-page="changePage"
  >
    <template #[`cell-worker_application.electronic_number`]="{ row }">
      <UIElectronicNumber :value="row?.worker_application?.electronic_number" />
    </template>

    <template #[`cell-worker_application.type.name`]="{ row }">
      <UITableNameCell :name="row?.worker_application?.type.name" @click="onPreview(row)" />
    </template>

    <!-- Raqam korxona+yil bo'yicha ketma-ket; takroriylari eski (2026-07 gacha) yozuvlar. -->
    <template #[`cell-worker_application.number`]="{ row }">
      <UITableBadgeCell :number="row?.worker_application?.number" type="primary" />
    </template>

    <template #[`cell-worker_application.worker`]="{ row }">
      <UIUser
        :data="{
          photo: row?.worker_application?.worker.photo,
          firstName: row?.worker_application?.worker.first_name,
          middleName: row?.worker_application?.worker.middle_name,
          lastName: row?.worker_application?.worker.last_name,
          position: row?.worker_application?.worker?.birthday
        }"
      />
    </template>


    <template #[`cell-worker_application.confirmation`]="{ row }">
      <UIStatus :status="appStatus(row?.worker_application)" />
    </template>

    <template #[`cell-worker_application.generate`]="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.worker_application.generate]" />
    </template>

    <template #[`cell-worker_application.created_at`]="{ row }">
      {{ Utils.timeOnlyDate(row?.worker_application.created_at) }}
    </template>
  </UITable>
</template>
