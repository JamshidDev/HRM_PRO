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
  import { useConfirmationMaterialLiabilityStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Eye16Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useConfirmationMaterialLiabilityStore()
  const emits = defineEmits(['openOffice'])

  const onPreview = (row) => {
    emits('openOffice', { documentId: row.document?.id, signatureId: row.id })
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    { key: 'assets', title: t('materialLiabilityPage.form.assets'), minWidth: 240 },
    { key: 'worker', title: t('confirmation.contract.form.worker'), minWidth: 220 },
    { key: 'number', title: t('confirmation.contract.form.number'), width: 100, align: 'center' },
    { key: 'electronic_number', title: t('documentSettings.electronicNumber'), width: 130 },
    { key: 'status', title: t('content.status'), width: 140 },
    { key: 'contract_date', title: t('content.date'), width: 140 }
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
    storage-key="docflow-confirmation-material-liability"
    @change-page="changePage"
  >
    <template #cell-assets="{ row }">
      <UITableNameCell :name="row.document?.assets" @click="onPreview(row)" />
    </template>

    <template #cell-worker="{ row }">
      <UIUser
        v-if="row.document?.worker"
        :data="{
          photo: row.document.worker.photo,
          lastName: row.document.worker.last_name,
          firstName: row.document.worker.first_name,
          middleName: row.document.worker.middle_name,
          position: row.document.position_name || $t('content.no-data')
        }"
      />
      <span v-else class="text-textColor3">—</span>
    </template>

    <template #cell-number="{ row }">
      <UITableBadgeCell :number="row.document?.number" type="error" />
    </template>

    <template #cell-electronic_number="{ row }">
      <UIElectronicNumber :value="row.document?.electronic_number" />
    </template>

    <template #cell-status="{ row }">
      <UIStatus :status="row?.status" />
    </template>

    <template #cell-contract_date="{ row }">
      {{ Utils.timeOnlyDate(row.document?.contract_date) }}
    </template>
  </UITable>
</template>
