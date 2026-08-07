<script setup>
  import { UITable } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useSpecializationStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useSpecializationStore()
  const accStore = useAccountStore()

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.lmsSpecializationWrite)) return
    store.elementId = row.id
    store._show()
    store.visibleType = false
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.lmsSpecializationWrite)) return
    store.elementId = row.id
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
      title: t('content.nameUz'),
      minWidth: 200
    },
    {
      key: 'name_ru',
      title: t('content.nameRu'),
      minWidth: 200
    },
    {
      key: 'name_en',
      title: t('content.nameEn'),
      minWidth: 200
    },
    {
      key: 'direction.name',
      title: t('specializationPage.form.direction'),
      minWidth: 200
    },
    {
      key: 'positions_count',
      title: t('specializationPage.form.positions'),
      width: 140,
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
  <UITable
    permission-prefix="lms-specialization"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="lms-specialization"
    @change-page="changePage"
  >
    <template #cell-positions_count="{ row }">
      <n-button circle>{{ row.positions_count }}</n-button>
    </template>
  </UITable>
</template>
