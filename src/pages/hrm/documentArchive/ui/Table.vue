<script setup>
  import { UIStatus, UITable } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useDocumentArchiveStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { ArrowCircleDown48Regular, Delete20Regular, Edit32Regular } from '@vicons/fluent'
  import { v4 as uuidv4 } from 'uuid'

  const { t } = i18n.global

  const store = useDocumentArchiveStore()
  const accStore = useAccountStore()

  const openFile = (url) => {
    window.open(url, '_blank')
  }

  const statusData = (id) => {
    return store.visibleTypes.filter((v) => v.id === id)?.[0]
  }

  const onEdit = (v) => {
    if (!accStore.checkAction(accStore.pn.hrDocumentsWrite)) return
    store.elementId = v.id
    store.payload.title = v.title
    store.payload.description = v.description
    store.payload.document_date = new Date(v.document_date).getTime()
    store.payload.type = v.type.id
    store.payload.visibility_type = v.visibility_type
    store.payload.file = [
      {
        id: uuidv4(),
        name: Utils.fileNameFromUrl(v.file),
        file: v.file
      }
    ]
    store.visibleType = false
    store.visible = true
  }

  const onDelete = (v) => {
    if (!accStore.checkAction(accStore.pn.hrDocumentsWrite)) return
    store.elementId = v.id
    store._delete()
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'title',
      title: t('documentArchive.form.title'),
      minWidth: 200
    },
    {
      key: 'type',
      title: t('documentArchive.form.type'),
      minWidth: 200
    },
    {
      key: 'visibility_type',
      title: t('documentArchive.form.visibility_type'),
      width: 200
    },
    {
      key: 'description',
      title: t('documentArchive.form.description'),
      minWidth: 100
    },
    {
      key: 'file',
      title: t('documentArchive.form.file'),
      width: 120,
      align: 'center'
    },
    {
      key: 'document_date',
      title: t('documentArchive.form.document_date'),
      width: 120
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
    storage-key="hrm-document-archive"
    @change-page="changePage"
  >
    <template #cell-type="{ row }">
      <UIStatus :status="row.type" />
    </template>

    <template #cell-visibility_type="{ row }">
      <UIStatus :status="statusData(row.visibility_type)" />
    </template>

    <template #cell-file="{ row }">
      <n-button @click="openFile(row.file)" size="small">
        <template #icon>
          <ArrowCircleDown48Regular />
        </template>
      </n-button>
    </template>

    <template #cell-document_date="{ row }">
      {{ Utils.timeOnlyDate(row.document_date) }}
    </template>
  </UITable>
</template>
