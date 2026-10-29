<script setup>
  import {
    UIElectronicNumber,
    UIStatus,
    UITable,
    UITableBadgeCell,
    UITableNameCell,
    UIUser
  } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useMaterialLiabilityStore } from '@/store/modules/index.js'
  import { useNotify } from '@/composables/useNotify'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, Edit32Regular, Eye16Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useMaterialLiabilityStore()
  const accStore = useAccountStore()
  const notify = useNotify()
  const emits = defineEmits(['openOffice'])

  const onView = (row) => {
    if (!accStore.checkAction(accStore.pn.hrContractsRead)) return
    emits('openOffice', row.id)
  }

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrContractsWrite)) return
    store._openEdit(row.id, (block) => notify.warning(t(`materialLiabilityPage.locked.${block}`)))
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrContractsDelete)) return
    store._delete(row.id)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    { key: 'worker', title: t('contractPage.table.worker'), minWidth: 220 },
    { key: 'number', title: t('contractPage.table.number'), width: 120, align: 'center' },
    { key: 'electronic_number', title: t('documentSettings.electronicNumber'), width: 130 },
    { key: 'assets', title: t('materialLiabilityPage.form.assets'), minWidth: 260 },
    { key: 'organization.name', title: t('contractPage.table.organization'), minWidth: 200 },
    { key: 'confirmation', title: t('contractPage.table.status'), width: 140 },
    { key: 'generate', title: t('content.document'), width: 120 },
    { key: 'contract_date', title: t('contractPage.table.date'), width: 120 }
  ])

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
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
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
    storage-key="hrm-material-liability"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <div class="cursor-pointer" @click="onView(row)">
        <UIUser
          v-if="row.worker"
          :data="{
            photo: row.worker.photo,
            position: row.worker.birthday,
            lastName: row.worker.last_name,
            firstName: row.worker.first_name,
            middleName: row.worker.middle_name
          }"
        />
        <span v-else class="text-textColor3">—</span>
      </div>
    </template>

    <template #cell-number="{ row }">
      <UITableBadgeCell :number="row?.number" type="primary" />
    </template>

    <template #cell-electronic_number="{ row }">
      <UIElectronicNumber :value="row?.electronic_number" />
    </template>

    <template #cell-assets="{ row }">
      <UITableNameCell :name="row?.assets" :created-at="row.created_at" @click="onView(row)" />
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus :status="row?.confirmation" />
    </template>

    <template #cell-generate="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.generate]" />
    </template>

    <template #cell-contract_date="{ row }">
      {{ Utils.timeOnlyDate(row?.contract_date) }}
    </template>
  </UITable>
</template>
