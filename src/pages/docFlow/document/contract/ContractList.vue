<script setup>
  import { UIChip, UIStatus, UITable, UITableBadgeCell, UITableNameCell, UIUser, UIElectronicNumber } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useContractStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { useNotify } from '@/composables/useNotify'
  import {
    ArrowSyncCheckmark20Filled,
    Delete20Regular,
    DocumentCheckmark24Regular,
    Edit20Regular,
    Eye16Regular,
    ReceiptAdd24Regular
  } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useContractStore()
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

  const notify = useNotify()
  // Tahrir: tasdiqlangan yoki tahrir imkoniyatidan oldingi shartnoma — sababi ko'rsatiladi.
  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrContractsWrite)) return
    store._openEdit(row.id, (block) => notify.warning(t(`contractPage.edit.locked.${block}`)))
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
      key: 'electronic_number',
      title: t('documentSettings.electronicNumber'),
      width: 130
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
      width: 165,
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
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit20Regular),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    }
  ])
  // Backend shartnoma holati (1 Jarayonda, 2 Aktiv, 3 Yakunlangan) → UIStatus id.
  const contractStatusUi = { 1: 1, 2: 6, 3: 16 }
  // «Buyruq» ustuni (command_status) → chip rangi va ikonkasi.
  const commandStatusUi = {
    1: { tone: 'amber', icon: ReceiptAdd24Regular },
    2: { tone: 'brand', icon: ArrowSyncCheckmark20Filled },
    3: { tone: 'neutral', icon: DocumentCheckmark24Regular }
  }
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
    storage-key="hrm-contract-v2"
    @change-page="changePage"
  >
    <template #cell-type="{ row }">
      <UITableNameCell
        :name="row?.type?.name"
        :created-at="row.created_at"
        @click="onPreview(row)"
      />
    </template>

    <template #cell-electronic_number="{ row }">
      <UIElectronicNumber :value="row?.electronic_number" />
    </template>

    <template #cell-number="{ row }">
      <UITableBadgeCell :number="row?.number" type="primary" />
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
      <!-- Umumiy chip (UIChip). Backend: 1 — buyruq kerak (sariq, bosilsa buyruq ochiladi), 2 — Shakllantirildi
           (ko'k, bosilmaydi — buyruq bor), 3 — Majburiy emas (kulrang, bosilsa baribir buyruq qilsa bo'ladi). -->
      <UIChip
        :label="row?.command_status?.name"
        :tone="commandStatusUi[row?.command_status?.id]?.tone ?? 'neutral'"
        :icon="commandStatusUi[row?.command_status?.id]?.icon"
        :class="row?.command_status?.id !== 2 ? 'cursor-pointer transition hover:brightness-95' : ''"
        tooltip
        @click="onOpenCommand(row)"
      />
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus :status="row?.confirmation" />
    </template>

    <template #cell-status="{ row }">
      <!-- Shartnoma holati: 1 Jarayonda → sariq soat (boshqa ustunlardagi «Jarayonda» bilan bir xil),
           2 Aktiv → yashil nuqta (✓ «Tasdiqlangan» bilan adashmasin), 3 Yakunlangan → kulrang ✓. -->
      <UIStatus :status="{ name: row?.status?.name, id: contractStatusUi[row?.status?.id] ?? 2 }" />
    </template>

    <template #cell-generate="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.generate]" />
    </template>

    <template #cell-contract_date="{ row }">
      {{ Utils.timeOnlyDate(row?.contract_date) }}
    </template>
  </UITable>
</template>
