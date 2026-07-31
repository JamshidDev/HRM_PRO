<script setup>
  import { UITable } from '@/components/index.js'
  import { AddCircle28Regular, Edit32Regular, Delete20Regular } from '@vicons/fluent'
  import { useMilitaryStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useMilitaryStore()

  const onAdd = () => {
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const onEdit = (v) => {
    store.activeTab = 1
    store.visibleType = false
    store.elementId = v.id
    store.payload.name = v.name
    store.payload.status = v.status.id
    store.payload.number = v.number
    store.payload.speciality = v.speciality
    store.payload.commissariat = v.commissariat
    store.visible = true
  }

  const onDelete = (v) => {
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
      key: 'name',
      title: t('militaryPage.form.name'),
      minWidth: 100
    },
    {
      key: 'status.name',
      title: t('militaryPage.form.status'),
      minWidth: 100
    },
    {
      key: 'number',
      title: t('militaryPage.form.number'),
      minWidth: 60
    },
    {
      key: 'speciality',
      title: t('militaryPage.form.speciality'),
      minWidth: 300
    },
    {
      key: 'commissariat',
      title: t('militaryPage.form.commissariat'),
      minWidth: 300
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
      $t('militaryPage.title')
    }}</span>
    <span v-else class="text-sm text-gray-300">{{ $t('militaryPage.no-data') }}</span>

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
  />
</template>

<style scoped></style>
