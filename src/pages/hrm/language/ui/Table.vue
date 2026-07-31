<script setup>
  import { UITable } from '@/components/index.js'
  import { ArrowCircleDown24Regular, AddCircle28Regular, Edit32Regular, Delete20Regular } from '@vicons/fluent'
  import { useLanguageStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useLanguageStore()

  const onAdd = () => {
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const onEdit = (v) => {
    store.activeTab = 1
    store.visibleType = false
    store.elementId = v.id
    store.payload.language_id = v.language.id
    store.payload.file = {
      name: v.file
    }
    store.visible = true
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  const onDownload = (v) => {
    window.open(v.file, '_blank')
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'language.name',
      title: t('content.name'),
      minWidth: 100
    },
    {
      key: 'file',
      title: t('content.file'),
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
  <div
    class="w-full flex justify-between items-end border-surface-line border-dashed pb-2 mt-16"
    :class="store.list.length === 0 && 'border-b'"
  >
    <span class="text-lg font-medium" v-if="store.list.length > 0">{{
      $t('languagePage.title')
    }}</span>
    <span v-else class="text-sm text-gray-300">{{ $t('languagePage.no-language') }}</span>

    <n-button round @click="onAdd">
      <template #icon>
        <AddCircle28Regular />
      </template>
      {{ $t(`content.add`) }}
    </n-button>
  </div>

  <UITable
    class="mt-4"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    @change-page="changePage"
  >
    <template #cell-file="{ value }">
      <n-button v-if="value" @click="onDownload({ file: value })">
        <template #icon>
          <ArrowCircleDown24Regular />
        </template>
        {{ $t('content.download') }}
      </n-button>
    </template>
  </UITable>
</template>

<style scoped></style>
