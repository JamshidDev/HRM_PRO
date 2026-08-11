<script setup>
  import { UITable, UITableNameCell } from '@/components/index.js'
  import { useMobileStoryStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import {
    CheckmarkCircle16Filled,
    Delete20Regular,
    Edit32Regular,
    Folder16Filled
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useMobileStoryStore()

  // Sarlavha tili — "Nomi" ustuni header'idagi select; default interfeys tili.
  const lang = ref(i18n.global.locale)
  const langOptions = [
    { id: 'uz', name: t('content.uz') },
    { id: 'ru', name: t('content.ru') },
    { id: 'en', name: t('content.en') }
  ]

  const rowTitle = (row) => row?.title?.[lang.value] || row?.title?.uz

  const openStory = (id) => {
    store._openEdit(id)
  }

  const onEdit = (row) => {
    openStory(row.id)
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
      key: 'title',
      title: t('content.name'),
      minWidth: 260
    },
    {
      key: 'status',
      title: t('content.status'),
      width: 190
    },
    {
      key: 'published_at',
      title: t('mobileStoryPage.form.publishedAt'),
      width: 200
    },
    {
      key: 'views_count',
      title: t('mobileStoryPage.table.views'),
      width: 140
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
    :delete-warning="t('mobileStoryPage.deleteConfirm')"
    storage-key="admin-mobile-story"
    @change-page="changePage"
  >
    <template #header-title>
      <div class="flex items-center gap-2">
        <span class="text-sm text-textColor2 leading-[1.2]">{{ $t('content.name') }}</span>
        <n-select
          v-model:value="lang"
          class="ui-lang-select w-[68px]!"
          size="tiny"
          :options="langOptions"
          value-field="id"
          label-field="name"
        />
      </div>
    </template>

    <template #cell-title="{ row }">
      <UITableNameCell :name="rowTitle(row)" @click="openStory(row.id)" />
    </template>

    <template #cell-status="{ row }">
      <n-tag round :bordered="false" size="small" :type="row.status === 2 ? 'success' : 'default'">
        <span class="inline-flex items-center gap-1.5 font-medium">
          <n-icon :size="14" :component="row.status === 2 ? CheckmarkCircle16Filled : Folder16Filled" />
          {{
            row.status === 2
              ? $t('mobileStoryPage.status.published')
              : $t('mobileStoryPage.status.draft')
          }}
        </span>
      </n-tag>
    </template>

    <template #cell-published_at="{ row }">
      {{ row.published_at ?? '—' }}
    </template>

    <template #cell-views_count="{ row }">
      {{ row.views_count ?? 0 }}
    </template>
  </UITable>
</template>

<style scoped>
  /* Header qatori 42px — select uni cho'zib yubormasligi uchun ixcham. */
  .ui-lang-select {
    --n-height: 24px !important;
    --n-border-radius: 6px !important;
    --n-font-size: 12px !important;
  }
</style>
