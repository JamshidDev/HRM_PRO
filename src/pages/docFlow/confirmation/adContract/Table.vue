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

  // API qo'shimcha kelishuvni endi `document` kalitida qaytaradi (oldin
  // `contract_additional` edi) — ikkalasi ham qo'llab-quvvatlanadi. `document`
  // ichida tur va tashkilot faqat id — nomlari store'dagi ro'yxatlardan olinadi.
  // Shartnoma xodimi esa faqat `worker_id` bilan keladi — u asosiy shartnomadan
  // (`contract_id`) yuklanadi.
  const doc = (row) => row?.document ?? row?.contract_additional

  const typeName = (row) => {
    const type = doc(row)?.type
    return type?.name ?? store.typeNames[type]
  }

  const worker = (row) => {
    const d = doc(row)
    if (d?.worker) return { worker: d.worker, position: null }
    return store.contractWorkers[d?.contract_id]
  }

  const organizationName = (row) =>
    doc(row)?.organization?.name ?? store.organizationNames[doc(row)?.organization_id]

  const onPreview = (row) => {
    onOpenFile(doc(row)?.id, row.id)
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
      <UITableNameCell :name="typeName(row)" @click="onPreview(row)" />
    </template>

    <template #[`cell-contract_additional.worker`]="{ row }">
      <UIUser
        v-if="worker(row)?.worker"
        :data="{
          photo: worker(row).worker.photo,
          lastName: worker(row).worker.last_name,
          firstName: worker(row).worker.first_name,
          middleName: worker(row).worker.middle_name,
          position: worker(row).position || $t('content.no-data')
        }"
      />
      <span v-else class="text-textColor3">—</span>
    </template>

    <template #[`cell-contract_additional.organization.name`]="{ row }">
      {{ organizationName(row) }}
    </template>

    <template #[`cell-contract_additional.number`]="{ row }">
      <UITableBadgeCell :number="doc(row)?.number" type="error" />
    </template>

    <template #cell-status="{ row }">
      <UIStatus :status="row?.status" />
    </template>

    <template #[`cell-contract_additional.contract_date`]="{ row }">
      {{ Utils.timeOnlyDate(doc(row)?.contract_date) }}
    </template>

    <template #cell-generate="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.generate ?? doc(row)?.generate]" />
    </template>
  </UITable>
</template>
