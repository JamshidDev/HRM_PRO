<script setup>
  import {
    UIStatus,
    UITable,
    UITableBadgeCell,
    UITableNameCell,
    UIUser
  } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useConfirmationAdContractStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Eye16Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useConfirmationAdContractStore()

  const emits = defineEmits(['openOffice'])

  const onOpenFile = (documentId, signatureId) => {
    emits('openOffice', { documentId, signatureId })
  }

  const onPreview = (row) => {
    onOpenFile(row?.contract_additional.id, row.id)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'contract_additional.type.name',
      title: t('confirmation.contract.form.type'),
      minWidth: 200
    },
    {
      key: 'contract_additional.worker',
      title: t('confirmation.contract.form.worker'),
      minWidth: 220
    },
    {
      key: 'contract_additional.organization.name',
      title: t('confirmation.contract.form.organization'),
      minWidth: 260
    },
    {
      key: 'contract_additional.number',
      title: t('confirmation.contract.form.number'),
      width: 100,
      align: 'center'
    },
    {
      key: 'status',
      title: t('content.status'),
      width: 140
    },
    {
      key: 'contract_additional.contract_date',
      title: t('content.date'),
      width: 140
    },
    {
      key: 'generate',
      title: t('content.document'),
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
    storage-key="docflow-confirmation-ad-contract"
    @change-page="changePage"
  >
    <template #[`cell-contract_additional.type.name`]="{ row }">
      <UITableNameCell :name="row?.contract_additional?.type.name" @click="onPreview(row)" />
    </template>

    <template #[`cell-contract_additional.worker`]="{ row }">
      <UIUser
        :data="{
          photo: row?.contract_additional.worker.photo,
          lastName: row?.contract_additional.worker.last_name,
          firstName: row?.contract_additional.worker.first_name,
          middleName: row?.contract_additional.worker.middle_name,
          position: $t('content.no-data')
        }"
      />
    </template>

    <template #[`cell-contract_additional.number`]="{ row }">
      <UITableBadgeCell :number="row?.contract_additional?.number" type="error" />
    </template>

    <template #cell-status="{ row }">
      <UIStatus :status="row?.status" />
    </template>

    <template #[`cell-contract_additional.contract_date`]="{ row }">
      {{ Utils.timeOnlyDate(row?.contract_additional?.contract_date) }}
    </template>

    <template #cell-generate="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.generate]" />
    </template>
  </UITable>
</template>
