<script setup>
  import { UIStatus, UITable } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useComponentStore, useStructureReportStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import {
    ArrowCircleDown48Regular,
    Delete20Regular,
    Edit32Regular,
    Eye16Regular
  } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useStructureReportStore()
  const componentStore = useComponentStore()

  const emits = defineEmits(['openOffice'])

  const onOpenFile = (v) => {
    emits('openOffice', v)
  }

  const onView = (row) => {
    onOpenFile(row.id)
  }

  const onEdit = (row) => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
    store.openEditModal(row.uuid || row.id)
  }

  const onDownload = (row) => {
    store.openExcelModal(row.uuid || row.id)
  }

  const onDelete = (row) => {
    store._delete(row.id)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'date',
      title: t('content.date'),
      width: 140
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      minWidth: 200
    },
    {
      key: 'count',
      title: t('content.count'),
      width: 120,
      align: 'center'
    },
    {
      key: 'confirmation',
      title: t('content.status'),
      width: 120
    },
    {
      key: 'generate',
      title: t('content.document'),
      width: 120
    },
    {
      key: 'createdDate',
      title: t('content.createdDate'),
      width: 120
    }
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
      label: t('content.download'),
      key: Utils.ActionTypes.download,
      icon: UIHelper.renderIcon(ArrowCircleDown48Regular),
      action: onDownload
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
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-structure-report"
    @change-page="changePage"
  >
    <template #cell-date="{ row }">
      <span
        @click="onOpenFile(row.id)"
        class="group hover:!text-primary hover:underline cursor-pointer"
      >
        {{ Utils.getMonthNameById(row.month) }} {{ row.year }}
        <br />
        <span class="opacity-65 text-xs group-hover:!text-primary">
          {{ Utils.timeHHMMWithMonth(row.created_at) }}
        </span>
      </span>
    </template>

    <template #cell-count="{ row }">
      <n-button type="primary" class="font-medium" round dashed size="tiny">
        {{ row.details_count }}
      </n-button>
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus :status="row?.confirmation" />
    </template>

    <template #cell-generate="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.generate]" />
    </template>

    <template #cell-createdDate="{ row }">
      {{ Utils.timeOnlyDate(row?.created_at) }}
    </template>
  </UITable>
</template>
