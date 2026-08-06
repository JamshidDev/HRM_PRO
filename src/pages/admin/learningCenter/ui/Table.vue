<script setup>
  import { UITable, UIUser, UIMore } from '@/components/index.js'
  import { useLearningCenterStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const accStore = useAccountStore()
  const store = useLearningCenterStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.learningCentersWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.learningCentersWrite)) return
    store.elementId = row.id
    store.payload.name = row.name
    store.payload.name_ru = row.name_ru
    store.payload.name_en = row.name_en
    store.payload.code = row.code
    store.payload.users = row.users.map((x) => x.id)
    store.userList = row.users.map((z) => ({
      id: z.id,
      name: Utils.combineFullName(z.worker),
      position: z.worker.id
    }))
    store.visibleType = false
    store.visible = true
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
      key: 'code',
      title: t('content.code'),
      width: 120
    },
    {
      key: 'users',
      title: t('content.users'),
      minWidth: 240,
      width: 280
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
    storage-key="admin-learning-center"
    @change-page="changePage"
  >
    <template #cell-users="{ row }">
      <UIMore width="250" :data="row.users">
        <template #content="{ data }">
          <UIUser
            :data="{
              photo: data.worker.photo,
              lastName: data.worker.last_name,
              firstName: data.worker.first_name,
              middleName: data.worker.middle_name,
              position: data.phone
            }"
          />
        </template>
      </UIMore>
    </template>
  </UITable>
</template>
