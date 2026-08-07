<script setup>
  import { UIStatus, UITable, UITableBadgeCell, UITableNameCell, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useComponentStore, useContractStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import {
    ArrowSyncCheckmark20Filled,
    CheckmarkCircle32Regular,
    Delete20Regular,
    DocumentCheckmark24Regular,
    Eye16Regular,
    ReceiptAdd24Regular
  } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useContractStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const emits = defineEmits(['openOffice', 'commandEv'])

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onPreview = (row) => {
    if (!accStore.checkAction(accStore.pn.hrContractsRead)) return
    emits('openOffice', row.id)
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrContractsWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const onConfirm = (row) => {
    if (!accStore.checkAction(accStore.pn.hrContractsWrite)) return
    store.elementId = row.id
    componentStore.files = []
    componentStore.fileVisible = true
  }

  const onOpenCommand = (row) => {
    if (row?.command_status?.id === 2) return
    emits('commandEv', row)
  }

  const columns = computed(() => [
    {
      key: 'type',
      title: t('contractPage.table.type'),
      minWidth: 280
    },
    {
      key: 'number',
      title: t('contractPage.table.number'),
      width: 140
    },
    {
      key: 'worker',
      title: t('contractPage.table.worker'),
      minWidth: 200
    },
    {
      key: 'organization.name',
      title: t('contractPage.table.organization'),
      minWidth: 260
    },
    {
      key: 'command_status',
      title: t('contractPage.table.command'),
      width: 140,
    },
    {
      key: 'confirmation',
      title: t('content.confirmStatus'),
      width: 140,
    },
    {
      key: 'status',
      title: t('contractPage.table.status'),
      width: 140,
    },
    {
      key: 'generate',
      title: t('content.document'),
      width: 140,
    },
    {
      key: 'contract_date',
      title: t('contractPage.table.date'),
      width: 140
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
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    },
    {
      label: t('content.confirm'),
      key: Utils.ActionTypes.confirm,
      icon: UIHelper.renderIcon(CheckmarkCircle32Regular),
      action: onConfirm
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-contracts"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-contract"
    @change-page="changePage"
  >
    <template #cell-type="{ row }">
      <UITableNameCell
        :name="row?.type?.name"
        :created-at="row.created_at"
        @click="onPreview(row)"
      />
    </template>

    <template #cell-number="{ row }">
      <UITableBadgeCell :number="row?.number" type="info" />
    </template>

    <template #cell-worker="{ row }">
      <UIUser
        :data="{
          photo: row.worker.photo,
          position: row.worker.birthday,
          lastName: row.worker.last_name,
          firstName: row.worker.first_name,
          middleName: row.worker.middle_name
        }"
      />
    </template>

    <template #cell-command_status="{ row }">
      <n-button
        dashed
        :type="row?.command_status.id === 1 ? 'primary' : 'default'"
        @click="onOpenCommand(row)"
        size="tiny"
      >
        <template #icon>
          <ReceiptAdd24Regular v-if="row?.command_status.id === 1" />
          <ArrowSyncCheckmark20Filled v-else-if="row?.command_status.id === 2" />
          <DocumentCheckmark24Regular v-else-if="row?.command_status.id === 3" />
        </template>
        {{ row?.command_status?.name }}
      </n-button>
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus :status="row?.confirmation" />
    </template>

    <template #cell-status="{ row }">
      <UIStatus
        :status="{
          name: row?.status.name,
          id: row?.status.id === 2 ? 3 : 2
        }"
      />
    </template>

    <template #cell-generate="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.generate]" />
    </template>

    <template #cell-contract_date="{ row }">
      {{ Utils.timeOnlyDate(row?.contract_date) }}
    </template>
  </UITable>
</template>
