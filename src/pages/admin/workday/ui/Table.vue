<script setup>
  import { UITable } from '@/components/index.js'
  import { useWorkdayStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useWorkdayStore()

  const format = (v) => {
    if (v) {
      const date = new Date()
      date.setHours(v.split(':')[0])
      date.setMinutes(v.split(':')[1])
      date.setSeconds(v.split(':')[2])
      return date.getTime()
    } else return null
  }

  const onEdit = (row) => {
    store.visibleType = false
    store.elementId = row.id
    store.payload.schedule_id = row.schedule.id
    store.payload.type = row.type.id
    store.payload.day_of_week = row.day_of_week.toString()
    store.payload.start_time = format(row.start_time)
    store.payload.end_time = format(row.end_time)
    store.visible = true
  }

  const onDelete = (row) => {
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
      key: 'schedule.name',
      title: t('workdayPage.form.schedule_id'),
      minWidth: 200
    },
    {
      key: 'type.name',
      title: t('workdayPage.form.type'),
      minWidth: 200
    },
    {
      key: 'day_of_week',
      title: t('workdayPage.form.day_of_week'),
      minWidth: 200
    },
    {
      key: 'start_time',
      title: t('workdayPage.form.start_time'),
      minWidth: 200
    },
    {
      key: 'end_time',
      title: t('workdayPage.form.end_time'),
      minWidth: 200
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
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="admin-workday"
    @change-page="changePage"
  />
</template>
