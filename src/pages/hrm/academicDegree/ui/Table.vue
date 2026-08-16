<script setup>
  import { UITable, UIProfileSection, UIProfileEmpty, UIFileDownload } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAcademicDegreeStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useAcademicDegreeStore()

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

  const columns = computed(() => [
    {
      key: 'type.name',
      title: t('academicDegreePage.form.type'),
      minWidth: 100
    },
    {
      key: 'file',
      title: t('academicDegreePage.form.file'),
      width: 200,
      align: 'center'
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
  <UIProfileSection :title="$t('academicDegreePage.title')" @add="onAdd">
    <UITable
      auto-height
      :columns="columns"
      :actions="actions"
      :data="store.list"
      :loading="store.loading"
      storage-key="hrm-academic-degree"
    >
      <template #empty><UIProfileEmpty /></template>

      <template #cell-file="{ row }">
        <UIFileDownload :file="row.file" />
      </template>
    </UITable>
  </UIProfileSection>
</template>

<style scoped></style>
