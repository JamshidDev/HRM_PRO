<script setup>
  import { UIStatus, UITable, UITableBadgeCell, UITableNameCell } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useConfirmCommandStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Eye16Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useConfirmCommandStore()

  const emits = defineEmits(['openOffice'])

  const onOpenFile = (documentId, signatureId) => {
    emits('openOffice', { documentId, signatureId })
  }

  const onPreview = (row) => {
    onOpenFile(row?.command.id, row.id)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'command.type.name',
      title: t('confirmation.contract.form.type'),
      minWidth: 200
    },
    {
      key: 'command.command_number',
      title: t('confirmation.contract.form.number'),
      width: 100,
      align: 'center'
    },
    {
      key: 'command.organization.name',
      title: t('confirmation.contract.form.organization'),
      minWidth: 260
    },
    {
      key: 'status',
      title: t('content.status'),
      width: 140
    },
    {
      key: 'generate',
      title: t('content.document'),
      width: 140
    },
    {
      key: 'command.command_date',
      title: t('content.date'),
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
    storage-key="docflow-confirmation-command"
    @change-page="changePage"
  >
    <template #[`cell-command.type.name`]="{ row }">
      <UITableNameCell :name="row?.command?.type.name" @click="onPreview(row)" />
    </template>

    <template #[`cell-command.command_number`]="{ row }">
      <UITableBadgeCell :number="row?.command?.command_number" type="primary" />
    </template>

    <template #cell-status="{ row }">
      <UIStatus :status="row?.status" />
    </template>

    <template #cell-generate="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.generate]" />
    </template>

    <template #[`cell-command.command_date`]="{ row }">
      {{ Utils.timeOnlyDate(row?.command?.command_date) }}
    </template>
  </UITable>
</template>
