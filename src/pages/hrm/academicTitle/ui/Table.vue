<script setup>
  import { UITable, UIProfileSection, UIProfileEmpty, UIFileDownload } from '@/components/index.js'
  import { useAcademicTitleStore } from '@/store/modules/index.js'
  import { Edit32Regular, Delete20Regular } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useAcademicTitleStore()

  const columns = computed(() => [
    {
      key: 'type.name',
      title: t('academicTitlePage.form.type'),
      minWidth: 100
    },
    {
      key: 'file',
      title: t('academicTitlePage.form.file'),
      width: 200,
      align: 'center'
    }
  ])

  const onAdd = () => {
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const onEdit = (v) => {
    store.activeTab = 1
    store.visibleType = false
    store.elementId = v.id
    store.payload.type = v.type.id
    store.payload.file = [
      {
        id: v.id,
        name: Utils.fileNameFromUrl(v.file),
        file: null
      }
    ]
    store.visible = true
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  const onDownload = (url) => {
    window.open(url, '_blank')
  }

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
  <UIProfileSection :title="$t('academicTitlePage.title')" @add="onAdd">
    <UITable
      auto-height
      :columns="columns"
      :actions="actions"
      :data="store.list"
      :loading="store.loading"
    >
      <template #empty><UIProfileEmpty /></template>

      <template #cell-file="{ row }">
        <UIFileDownload :file="row.file" />
      </template>
    </UITable>
  </UIProfileSection>
</template>

<style scoped></style>
