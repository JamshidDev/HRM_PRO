<script setup>
  import { UITable } from '@/components/index.js'
  import { useNewsCategoryStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useNewsCategoryStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onEdit = (row) => {
    store.elementId = row.id
    store.payload.name = {
      uz: row.name?.uz ?? '',
      ru: row.name?.ru ?? '',
      en: row.name?.en ?? ''
    }
    store.visibleType = false
    store.visible = true
  }

  const onDelete = (row) => {
    store.elementId = row.id
    store._delete()
  }

  const columns = computed(() => [
    {
      key: 'name.uz',
      title: t('newsCategoryPage.langUz')
    },
    {
      key: 'name.ru',
      title: t('newsCategoryPage.langRu')
    },
    {
      key: 'name.en',
      title: t('newsCategoryPage.langEn')
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
    storage-key="chat-news-category"
    @change-page="changePage"
  >
    <template #[`cell-name.uz`]="{ row }">
      {{ row.name?.uz ?? '—' }}
    </template>

    <template #[`cell-name.ru`]="{ row }">
      {{ row.name?.ru ?? '—' }}
    </template>

    <template #[`cell-name.en`]="{ row }">
      {{ row.name?.en ?? '—' }}
    </template>
  </UITable>
</template>
