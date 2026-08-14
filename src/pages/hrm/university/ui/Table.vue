<script setup>
  import { UITable, UIProfileSection, UIProfileEmpty, UIFileDownload } from '@/components/index.js'
  import { Edit32Regular, Delete20Regular } from '@vicons/fluent'
  import { useUniversityStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useUniversityStore()

  const onAdd = () => {
    if (store.universityList.length === 0) {
      store._getUniversityList()
    }
    if (store.specialityList.length === 0) {
      store._getSpeciality()
    }
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const onEdit = (v) => {
    store.activeTab = 1
    store.visibleType = false
    store.elementId = v.id
    store.specialityList = [v.speciality]
    store.universityList = [v.university]
    store.payload.university_id = v.university.id
    store.payload.speciality_id = v.speciality.id
    store.payload.from_date = new Date(v.from_date).getTime()
    store.payload.to_date = new Date(v.to_date).getTime()
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
      key: 'university.name',
      title: t('universityPage.form.university_id'),
      minWidth: 100
    },
    {
      key: 'speciality.name',
      title: t('universityPage.form.speciality_id'),
      minWidth: 80
    },
    {
      key: 'from_date',
      title: t('universityPage.form.from_date'),
      width: 120
    },
    {
      key: 'to_date',
      title: t('universityPage.form.to_date'),
      width: 120
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
  <UIProfileSection :title="$t('universityPage.title')" @add="onAdd">
    <UITable
      auto-height
      :columns="columns"
      :actions="actions"
      :data="store.list"
      :loading="store.loading"
    >
      <template #empty><UIProfileEmpty /></template>

      <template #cell-from_date="{ value }">
        <span class="text-sm">{{ Utils.timeOnlyDate(value) }}</span>
      </template>

      <template #cell-to_date="{ value }">
        <span class="text-sm">{{ Utils.timeOnlyDate(value) }}</span>
      </template>

      <template #cell-file="{ row }">
        <UIFileDownload :file="row.file" />
      </template>
    </UITable>
  </UIProfileSection>
</template>

<style scoped></style>
