<script setup>
  import { UITable } from '@/components/index.js'
  import { useScheduleStore, useAccountStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const accStore = useAccountStore()
  const store = useScheduleStore()

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.schedulesWrite)) return
    store.visibleType = false
    store.elementId = row.id
    store.payload.name = row.name
    store.payload.name_ru = row.name_ru
    store.payload.type = row.type.id
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.schedulesWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    { key: 'name', title: t('content.name'), minWidth: 200 },
    { key: 'name_ru', title: t('schedulePage.form.name_ru'), minWidth: 200 },
    { key: 'type.name', title: t('schedulePage.form.type'), minWidth: 200 }
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
    permission-prefix="schedules"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="admin-schedule"
    @change-page="changePage"
  />
</template>
