<script setup>
  import { UITable, UIProfileSection, UIProfileEmpty, UIFileDownload } from '@/components/index.js'
  import { Edit32Regular, Delete20Regular } from '@vicons/fluent'
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
  <UIProfileSection :title="$t('languagePage.title')" @add="onAdd">
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
