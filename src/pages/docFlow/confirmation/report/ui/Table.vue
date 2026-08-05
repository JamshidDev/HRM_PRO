<script setup>
  import { UIStatus, UITable, UITableNameCell } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useConfirmationReportStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Eye16Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useConfirmationReportStore()

  const emits = defineEmits(['openOffice'])

  const onOpenFile = (documentId, signatureId) => {
    emits('openOffice', { documentId, signatureId })
  }

  const onPreview = (row) => {
    onOpenFile(row?.report?.id, row.id)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'report.month',
      title: t('content.date'),
      minWidth: 200
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
      key: 'report.created_at',
      title: t('content.createdDate'),
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
    storage-key="docflow-confirmation-report"
    @change-page="changePage"
  >
    <template #[`cell-report.month`]="{ row }">
      <UITableNameCell
        :name="`${Utils.getMonthNameById(row?.report?.month)} ${row?.report?.year}`"
        :created-at="row?.report?.created_at"
        @click="onPreview(row)"
      />
    </template>

    <template #cell-status="{ row }">
      <UIStatus :status="row?.status" />
    </template>

    <template #cell-generate="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.generate]" />
    </template>

    <template #[`cell-report.created_at`]="{ row }">
      {{ Utils.timeOnlyDate(row?.report?.created_at) }}
    </template>
  </UITable>
</template>
