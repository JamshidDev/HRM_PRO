<script setup>
  import { UITable } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useTopicStore, useAccountStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { Delete16Regular, Edit16Regular } from '@vicons/fluent'
  import UIHelper from '@/utils/UIHelper.js'

  const { t } = i18n.global

  const store = useTopicStore()
  const accStore = useAccountStore()

  const onRowClick = (row) => {
    if (!accStore.checkAction(accStore.pn.examTopicsRead)) return
    store.elementId = row.id
    store.activeTab = 'detail'
  }

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

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'name',
      title: t('content.name'),
      minWidth: 200
    },
    {
      key: 'type.name',
      title: t('content.type'),
      minWidth: 200
    },
    {
      key: 'exams_count',
      title: t('topicDetailsPage.exams.name'),
      width: 120,
      align: 'center'
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit16Regular),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete16Regular),
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
    storage-key="exam-topics"
    @change-page="changePage"
    @row-click="onRowClick"
  >
    <template #cell-name="{ row }">
      <span class="cursor-pointer hover:text-primary hover:underline transition-colors">
        {{ row?.name }}
      </span>
    </template>

    <template #cell-exams_count="{ row }">
      <n-button size="small" circle>{{ row?.exams_count }}</n-button>
    </template>
  </UITable>
</template>
