<script setup>
  import { UIBadge, UITable, UIUser } from '@/components/index.js'
  import { useCongratulationStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

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
      title: t('confirmationPage.table.worker'),
      width: 300
    },
    {
      key: 'message',
      title: t('content.messageContent'),
      minWidth: 500
    },
    {
      key: 'type',
      title: t('content.type'),
      width: 130
    },
    {
      key: 'status',
      title: t('content.status'),
      width: 120
    },
    {
      key: 'created_at',
      title: t('content.date'),
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
    storage-key="chat-congratulation"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.user?.worker.photo,
          firstName: row?.user?.worker.first_name,
          middleName: row?.user?.worker.middle_name,
          lastName: row?.user?.worker.last_name,
          position: row?.worker_position?.post_short_name
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
      <UIBadge :show-icon="false" :label="row?.type?.name" :type="Utils.colorTypes.dark" />
    </template>

    <template #cell-status="{ row }">
      <n-button :type="Boolean(row.status) ? 'success' : 'error'" size="tiny" secondary>
        {{ $t(row.status === 1 ? 'content.sent' : 'content.unSend') }}
      </n-button>
    </template>

    <template #cell-created_at="{ row }">
      <UIBadge
        :type="Utils.colorTypes.dark"
        :show-icon="false"
        :label="Utils.timeWithMonth(row.created_at)"
      />
    </template>
  </UITable>
</template>
