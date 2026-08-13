<script setup>
  import { UITable, UITablePagination, UIUser } from '@/components/index.js'
  import { useCongratulationStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import TypeBadge from './TypeBadge.vue'

  const { t } = i18n.global
  const store = useCongratulationStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onPreview = (row) => {
    store.selectedContent = row.message
    store.visible = true
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      width: 200
    },
    {
      key: 'message',
      title: t('content.messageContent'),
      minWidth: 350
    },
    {
      key: 'type',
      title: t('content.type'),
      width: 150
    },
    {
      key: 'status',
      title: t('content.status'),
      width: 130
    },
    {
      key: 'created_at',
      title: t('congratulation.table.sentAt'),
      width: 155
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
    storage-key="chat-congratulation"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :data="{
          photo: row?.user?.worker.photo,
          firstName: row?.user?.worker.first_name,
          middleName: row?.user?.worker.middle_name,
          lastName: row?.user?.worker.last_name
        }"
      />
    </template>

    <template #cell-message="{ row }">
      <div
        @click="onPreview(row)"
        class="line-clamp-2 hover:underline hover:text-primary cursor-pointer"
        v-html="row.message"
      ></div>
    </template>

    <template #cell-type="{ row }">
      <TypeBadge :type="row?.type" />
    </template>

    <template #cell-status="{ row }">
      {{ $t(row.status === 1 ? 'content.sent' : 'content.unSend') }}
    </template>

    <template #cell-created_at="{ row }">
      {{ Utils.timeWithMonth(row.created_at) }}
    </template>

    <template #footer>
      <UITablePagination
        :page="store.params.page"
        :per-page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </template>
  </UITable>
</template>
