<script setup>
  import { UITable } from '@/components/index.js'
import i18n from '@/i18n/index.js'
import { usePolyclinicStore } from '@/store/modules/index.js'
import UIHelper from '@/utils/UIHelper.js'
import Utils from '@/utils/Utils.js'
import { Delete20Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = usePolyclinicStore()

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
      key: 'name',
      title: t('content.name'),
      minWidth: 200
    }
  ])

  const actions = computed(() => [
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
    :storage-key="'hrm-med-polyclinic'"
    @change-page="changePage"
  />
</template>

<style scoped></style>
