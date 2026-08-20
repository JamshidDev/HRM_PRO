<script setup>
  import { UIUser, UIModal } from '@components'
  import { useNotificationStore } from '@stores'
  import { Utils } from '@utils'
  import i18n from '@/i18n/index.js'
  import { MoreHorizontal24Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useNotificationStore()

  // Holat filtri.
  const statusFilterOptions = computed(() => [
    { label: t('content.all'), value: null },
    { label: t('notificationPage.st.pending'), value: 'scheduled' },
    { label: t('notificationPage.st.sent'), value: 'sent' },
    { label: t('notificationPage.st.error'), value: 'error' },
    { label: t('notificationPage.st.cancelled'), value: 'cancelled' }
  ])

  const onStatusFilter = (v) => {
    store.pushLogsParams.status = v
    store.pushLogsParams.page = 1
    store._push_logs()
  }

  const changePage = (page) => {
    store.pushLogsParams.page = page
    store._push_logs()
  }

  // Backend 6 holat → 4 ko'rinadigan (badge + nuqta rangi).
  const STATUS_MAP = {
    scheduled: { key: 'pending', type: 'info' },
    sending: { key: 'pending', type: 'warning' },
    sent: { key: 'sent', type: 'success' },
    skipped: { key: 'sent', type: 'success' },
    error: { key: 'error', type: 'error' },
    cancelled: { key: 'cancelled', type: 'default' }
  }
  const statusView = (s) => {
    const m = STATUS_MAP[s] || { key: 'pending', type: 'default' }
    return { label: t(`notificationPage.st.${m.key}`), type: m.type }
  }
  const dotClass = (s) => {
    const type = (STATUS_MAP[s] || {}).type
    return {
      info: 'bg-info',
      warning: 'bg-warning',
      success: 'bg-success',
      error: 'bg-error',
      default: 'bg-gray-300'
    }[type || 'default']
  }

  const channelLabel = (row) => {
    if (row.channel === 'topic') return t(`notificationPage.topics.${row.topic}`)
    if (row.channel === 'batch') return t('notificationPage.byUser')
    return t('content.user')
  }

  const rowTime = (row) =>
    row.status === 'scheduled' || row.status === 'sending'
      ? row.scheduled_at
      : row.sent_at || row.scheduled_at

  const rowOptions = (row) => {
    const opts = [{ label: t('content.view'), key: 'view' }]
    if (row.status === 'scheduled') opts.push({ label: t('content.cancel'), key: 'cancel' })
    return opts
  }

  const viewRow = ref(null)
  const viewVisible = ref(false)
  const onAction = (key, row) => {
    if (key === 'view') {
      viewRow.value = row
      viewVisible.value = true
    } else if (key === 'cancel') {
      store._cancel_push(row.id)
    }
  }
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Filtr -->
    <div class="mb-3 flex items-center justify-between">
      <span class="text-sm font-semibold text-gray-500">{{ $t('notificationPage.logs') }}</span>
      <n-select
        class="w-44"
        size="small"
        :value="store.pushLogsParams.status"
        :options="statusFilterOptions"
        @update:value="onStatusFilter"
      />
    </div>

    <!-- Ro'yxat -->
    <n-spin :show="store.pushLogsLoading" class="flex-1">
      <div
        v-if="store.pushLogs.length"
        class="flex flex-col overflow-y-auto pr-1"
        style="max-height: calc(100vh - 320px)"
      >
        <div
          v-for="row in store.pushLogs"
          :key="row.id"
          class="group border-b border-surface-line px-1 py-3 transition-colors last:border-0 hover:bg-info/5"
        >
          <div class="flex items-start gap-2">
            <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full" :class="dotClass(row.status)" />
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <div class="truncate font-medium">{{ row.title || '—' }}</div>
                <n-dropdown
                  trigger="click"
                  :options="rowOptions(row)"
                  @select="(key) => onAction(key, row)"
                >
                  <n-button quaternary circle size="tiny">
                    <template #icon>
                      <n-icon><MoreHorizontal24Regular /></n-icon>
                    </template>
                  </n-button>
                </n-dropdown>
              </div>
              <div v-if="row.message" class="truncate text-xs text-gray-400">{{ row.message }}</div>

              <!-- meta -->
              <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                <n-tag :type="statusView(row.status).type" size="tiny" round>
                  {{ statusView(row.status).label }}
                </n-tag>
                <span>{{ channelLabel(row) }}</span>
                <span>· {{ row.recipients }} {{ $t('notificationPage.recipients') }}</span>
                <span v-if="rowTime(row)" class="ml-auto whitespace-nowrap">
                  {{ Utils.timeHHMMWithMonth(rowTime(row)) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <n-empty v-else class="py-10" />
    </n-spin>

    <!-- Paginatsiya -->
    <div v-if="store.pushLogsTotal > store.pushLogsParams.per_page" class="mt-3 flex justify-end">
      <n-pagination
        :page="store.pushLogsParams.page"
        :page-size="store.pushLogsParams.per_page"
        :item-count="store.pushLogsTotal"
        @update:page="changePage"
      />
    </div>

    <!-- Ko'rish modali -->
    <UIModal
      :width="560"
      :visible="viewVisible"
      @update:visible="(v) => (viewVisible = v)"
      :title="$t('content.view')"
    >
      <div v-if="viewRow" class="grid grid-cols-1 gap-2 text-sm">
        <div class="flex justify-between border-b pb-1">
          <span class="text-gray-500">{{ $t('content.title') }}</span>
          <span class="font-medium">{{ viewRow.title }}</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-gray-500">{{ $t('content.description') }}</span>
          <span class="text-right">{{ viewRow.message }}</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-gray-500">{{ $t('notificationPage.channel') }}</span>
          <span>{{ channelLabel(viewRow) }}</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-gray-500">{{ $t('content.status') }}</span>
          <n-tag :type="statusView(viewRow.status).type" size="small" round>
            {{ statusView(viewRow.status).label }}
          </n-tag>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-gray-500">{{ $t('notificationPage.recipients') }}</span>
          <span>{{ viewRow.recipients }}</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-gray-500">{{ $t('notificationPage.push') }}</span>
          <span>
            <span class="text-success">{{ viewRow.fcm_sent }}</span>
            <span v-if="viewRow.fcm_failed" class="text-error"> / {{ viewRow.fcm_failed }}</span>
          </span>
        </div>
        <div v-if="viewRow.error" class="flex justify-between border-b pb-1">
          <span class="text-gray-500">{{ $t('content.error') || 'Error' }}</span>
          <span class="text-error text-right">{{ viewRow.error }}</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-gray-500">{{ $t('notificationPage.sendTime') }}</span>
          <span>{{ viewRow.scheduled_at || '—' }}</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="text-gray-500">{{ $t('notificationPage.sentAt') }}</span>
          <span>{{ viewRow.sent_at || '—' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">{{ $t('notificationPage.sender') }}</span>
          <UIUser
            v-if="viewRow.sender"
            :data="{
              lastName: viewRow.sender.last_name,
              firstName: viewRow.sender.first_name,
              middleName: viewRow.sender.middle_name
            }"
          />
          <span v-else>—</span>
        </div>
      </div>
    </UIModal>
  </div>
</template>
