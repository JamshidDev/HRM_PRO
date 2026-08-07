<script setup>
  import { useTelegramStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { UITable, UIUser } from '@/components/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { Delete20Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const accStore = useAccountStore()
  const store = useTelegramStore()

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.telegramWrite)) return
    store.elementId = row.id
    store._delete()
  }

  // const onEdit = (v)=>{
  //   store.visibleType = false
  //   store.elementId = v.id
  //   store.payload.name = v.name
  //   store.visible = true
  // }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'user',
      title: t('content.staff'),
      minWidth: 200
    },
    {
      key: 'chat_id',
      title: t('telegramPage.chatId'),
      minWidth: 140
    },
    {
      key: 'created_at',
      title: t('content.created'),
      minWidth: 160
    }
  ])

  const actions = computed(() => [
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
    permission-prefix="telegram"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="admin-telegram"
    @change-page="changePage"
  >
    <template #cell-user="{ row }">
      <UIUser
        :data="{
          photo: row?.user.worker.photo,
          lastName: row?.user.worker.last_name,
          firstName: row?.user.worker.first_name,
          middleName: row?.user.worker.middle_name,
          position: row.user?.phone
        }"
      />
    </template>

    <template #[`cell-created_at`]="{ row }">
      {{ Utils.timeWithMonth(row?.created_at) }}
    </template>
  </UITable>
</template>
