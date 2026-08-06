<script setup>
  import { UITable } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useDirectionStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useDirectionStore()
  const accStore = useAccountStore()

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.lmsDirectionWrite)) return
    store.visibleType = false
    store.elementId = row.id
    store.payload.name = row.name
    store.payload.name_ru = row.name_ru
    store.payload.name_en = row.name_en
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.lmsDirectionWrite)) return
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
      title: t('content.nameUz'),
      minWidth: 200
    },
    {
      key: 'name_ru',
      title: t('content.nameRu'),
      minWidth: 200
    },
    {
      key: 'name_en',
      title: t('content.nameEn'),
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
    storage-key="lms-direction"
    @change-page="changePage"
  />
</template>
