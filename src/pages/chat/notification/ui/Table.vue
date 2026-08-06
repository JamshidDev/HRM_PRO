<script setup>
  import { UIEditorViewer, UITable, UIUser } from '@components'
  import { useNotificationStore } from '@stores'
  import { Utils } from '@utils'
  import i18n from '@/i18n/index.js'
  import NotificationBadge from '@pages/chat/notification/ui/NotificationBadge.vue'

  const { t } = i18n.global
  const store = useNotificationStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 220
    },
    {
      key: 'data.title',
      title: t('content.title'),
      minWidth: 200
    },
    {
      key: 'message',
      title: t('content.description'),
      minWidth: 400
    },
    {
      key: 'created_at',
      title: t('content.created'),
      width: 200
    },
    {
      key: 'read_at',
      title: t('content.read'),
      width: 200
    },
    {
      key: 'alert',
      title: t('content.type'),
      width: 200
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="chat-notification"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :data="{
          photo: row.user?.worker?.photo,
          lastName: row.user?.worker?.last_name,
          firstName: row.user?.worker?.first_name,
          middleName: row.user?.worker?.middle_name
        }"
      />
    </template>

    <template #cell-message="{ row }">
      <UIEditorViewer :html="row?.data?.message" />
    </template>

    <template #cell-created_at="{ row }">
      {{ Utils.timeHHMMWithMonth(row.created_at) }}
    </template>

    <template #cell-read_at="{ row }">
      {{ Utils.timeHHMMWithMonth(row?.read_at) }}
    </template>

    <template #cell-alert="{ row }">
      <NotificationBadge v-if="row.data?.alert" :alert="row.data?.alert" />
    </template>
  </UITable>
</template>
