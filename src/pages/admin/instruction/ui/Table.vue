<script setup>
  import { UITable } from '@/components/index.js'
  import { usePageInstructionStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const accStore = useAccountStore()
  const store = usePageInstructionStore()

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.instructionsWrite)) return
    store.elementId = row.id
    store.payload.text = row.text
    store.payload.title = row.title
    store.payload.photos = row.photos.map((v) => ({ photo: v.photo, id: v.id }))
    store.visibleType = false
    store.visible = true
    store.activeSection = 99999
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.instructionsWrite)) return
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
      key: 'title',
      title: t('content.name'),
      minWidth: 200
    },
    {
      key: 'menu',
      title: t('instructionPage.form.menu'),
      width: 200
    },
    {
      key: 'sub_menu',
      title: t('instructionPage.form.subMenu'),
      width: 200
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
    permission-prefix="instructions"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="admin-instruction"
    @change-page="changePage"
  />
</template>
