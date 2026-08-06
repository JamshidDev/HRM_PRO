<script setup>
  import { UITable, UITableNameCell } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useTopicStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useTopicStore()
  const accStore = useAccountStore()

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.examTopicsWrite)) return
    store.elementId = row.id
    store._show()
    store.visibleType = false
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.examTopicsWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const onRowClick = (row) => {
    if (!accStore.checkAction(accStore.pn.examTopicsRead)) return
    store.elementId = row.id
    store.activeTab = 'detail'
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'name',
      title: t('content.name'),
      minWidth: 240
    },
    {
      key: 'type.name',
      title: t('content.type'),
      minWidth: 260
    },
    {
      key: 'exams_count',
      title: t('topicDetailsPage.exams.name'),
      width: 140,
      align: 'center'
    }
  ])

  const actions = computed(() => [
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
    permission-prefix="exam-topics"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="attestation-topic"
    @change-page="changePage"
    @row-click="onRowClick"
  >
    <template #cell-name="{ row }">
      <UITableNameCell :name="row.name" />
    </template>

    <template #[`cell-exams_count`]="{ row }">
      <n-button size="small" circle>{{ row.exams_count }}</n-button>
    </template>
  </UITable>
</template>
