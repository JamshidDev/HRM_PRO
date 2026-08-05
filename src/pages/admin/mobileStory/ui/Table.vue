<script setup>
  import { useRouter } from 'vue-router'
  import { UITable } from '@/components/index.js'
  import { useMobileStoryStore } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useMobileStoryStore()
  const router = useRouter()

  const headerLang = ref('uz')
  const headerOption = [
    { name: t('content.nameUz'), id: 'uz' },
    { name: t('content.nameRu'), id: 'ru' },
    { name: t('content.nameEn'), id: 'en' }
  ]

  const openStory = (id) => {
    router.push(Utils.routePathMaker(`${AppPaths.MobileStories}/${id}`))
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
      title: '',
      minWidth: 220
    },
    {
      key: 'status',
      title: t('mobileStoryPage.table.status'),
      minWidth: 140
    },
    {
      key: 'published_at',
      title: t('mobileStoryPage.form.publishedAt'),
      minWidth: 160
    },
    {
      key: 'views_count',
      title: t('mobileStoryPage.table.views'),
      minWidth: 100,
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
    storage-key="admin-mobile-story"
    @change-page="changePage"
  >
    <template #header-title>
      <n-select
        v-model:value="headerLang"
        :options="headerOption"
        value-field="id"
        label-field="name"
      />
    </template>

    <template #cell-title="{ row }">
      <span class="cursor-pointer text-primary hover:underline" @click="openStory(row.id)">
        {{ row?.title?.[headerLang] ?? row?.title?.uz }}
      </span>
    </template>

    <template #cell-status="{ row }">
      <n-tag :type="row.status === 2 ? 'success' : 'default'" size="small" round>
        {{
          row.status === 2
            ? $t('mobileStoryPage.status.published')
            : $t('mobileStoryPage.status.draft')
        }}
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
