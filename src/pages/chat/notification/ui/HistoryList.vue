<script setup>
  import { UIUser, UIModal, UITable } from '@components'
  import { useNotificationStore } from '@stores'
  import { Utils } from '@utils'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'
  import {
    Eye24Regular,
    Dismiss24Regular,
    Globe20Regular,
    Person20Regular,
    CalendarLtr20Regular,
    DocumentCheckmark20Regular
  } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useNotificationStore()

  // Holat filtri.
  const statusFilterOptions = computed(() => [
    { label: t('notificationPage.st.pending'), value: 'scheduled' },
    { label: t('notificationPage.st.sent'), value: 'sent' },
    { label: t('notificationPage.st.error'), value: 'error' },
    { label: t('notificationPage.st.cancelled'), value: 'cancelled' }
  ])

  const onStatusFilter = (v) => {
    store.pushLogsParams.status = v ?? null
    store.pushLogsParams.page = 1
    store._push_logs()
  }

  const changePage = (v) => {
    store.pushLogsParams.page = v.page
    store.pushLogsParams.per_page = v.per_page
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

  // FCM xom xatosini tushunarli (foydalanuvchiga qulay) matnga aylantirish.
  const friendlyError = (err) => {
    if (!err) return ''
    const e = String(err).toLowerCase()
    if (
      e.includes('not a valid fcm') ||
      e.includes('not-registered') ||
      e.includes('unregistered') ||
      e.includes('requested entity was not found') ||
      e.includes('not found')
    )
      return "Qurilma tokeni yaroqsiz yoki ro'yxatdan chiqarilgan"
    if (e.includes('mismatchsenderid') || e.includes('sender'))
      return 'Token boshqa Firebase loyihasiga tegishli'
    if (e.includes('not_configured')) return 'FCM serverda sozlanmagan'
    if (e.includes('no_access_token') || e.includes('unauthenticated') || e.includes('auth'))
      return 'FCM autentifikatsiya xatosi (server kaliti)'
    if (e.includes('quota') || e.includes('rate') || e.includes('unavailable'))
      return "Limit oshdi yoki xizmat vaqtincha ishlamayapti, keyinroq urinib ko'ring"
    if (e.includes('invalid') || e.includes('bad request')) return "Xabar formati noto'g'ri"
    return err // noma'lum — asl matnni ko'rsatamiz
  }

  const rowTime = (row) =>
    row.status === 'scheduled' || row.status === 'sending'
      ? row.scheduled_at
      : row.sent_at || row.scheduled_at

  const viewRow = ref(null)
  const viewVisible = ref(false)
  const openView = (row) => {
    viewRow.value = row
    viewVisible.value = true
  }

  const rowActions = computed(() => [
    {
      label: t('content.view'),
      key: 'view',
      icon: UIHelper.renderIcon(Eye24Regular),
      action: openView
    },
    {
      label: t('content.cancel'),
      key: 'cancel',
      icon: UIHelper.renderIcon(Dismiss24Regular),
      visible: (row) => row.status === 'scheduled',
      action: (row) => store._cancel_push(row.id)
    }
  ])

  const columns = computed(() => [
    { key: 'status', title: t('content.status'), width: 130 },
    { key: 'title', title: t('content.title'), minWidth: 200 },
    { key: 'channel', title: t('notificationPage.channel'), width: 170 },
    { key: 'recipients', title: t('notificationPage.recipients'), width: 140, align: 'center' },
    { key: 'time', title: t('content.time'), width: 170 }
  ])
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Filtr -->
    <div class="mb-3 flex shrink-0 items-center justify-between gap-3">
      <span class="truncate text-sm font-semibold text-gray-500">
        {{ $t('notificationPage.sentList') }}
      </span>
      <div class="w-44 shrink-0">
        <n-select
          size="small"
          clearable
          :value="store.pushLogsParams.status"
          :options="statusFilterOptions"
          :placeholder="$t('content.all')"
          @update:value="onStatusFilter"
        />
      </div>
    </div>

    <!-- Ro'yxat — panel qolgan balandligini oladi, ichida jadval skroll bo'ladi.
         `UITable` `inheritAttrs: false` bo'lgani uchun tashqi `class` unga
         o'tmaydi — balandlikni shu o'rovchi `div` orqali beramiz. -->
    <div class="min-h-0 flex-1">
      <UITable
        :columns="columns"
        :actions="rowActions"
        :data="store.pushLogs"
        :loading="store.pushLogsLoading"
        :page="store.pushLogsParams.page"
        :per-page="store.pushLogsParams.per_page"
        :total="store.pushLogsTotal"
        :show-index="false"
        storage-key="chat-notification-history"
        @change-page="changePage"
        @row-click="openView"
      >
        <template #cell-status="{ row }">
          <n-tooltip
            v-if="statusView(row.status).type === 'error' && row.error"
            trigger="hover"
            placement="top"
          >
            <template #trigger>
              <n-tag type="error" size="small" round class="cursor-help" @click.stop>
                {{ statusView(row.status).label }}
              </n-tag>
            </template>
            <span class="max-w-xs break-words">{{ friendlyError(row.error) }}</span>
          </n-tooltip>
          <n-tag v-else :type="statusView(row.status).type" size="small" round>
            {{ statusView(row.status).label }}
          </n-tag>
        </template>

        <template #cell-title="{ row }">
          <div class="flex items-center gap-2 min-w-0">
            <span class="h-2 w-2 shrink-0 rounded-full" :class="dotClass(row.status)" />
            <span class="truncate font-medium text-textColor0">{{ row.title || '—' }}</span>
          </div>
        </template>

        <template #cell-channel="{ row }">
          <span class="text-textColor2">{{ channelLabel(row) }}</span>
        </template>

        <template #cell-recipients="{ row }">
          {{ row.recipients }}
        </template>

        <template #cell-time="{ row }">
          <span v-if="rowTime(row)" class="whitespace-nowrap text-textColor2">
            {{ Utils.timeHHMMWithMonth(rowTime(row)) }}
          </span>
          <span v-else>—</span>
        </template>
      </UITable>
    </div>

    <!-- Ko'rish modali -->
    <UIModal
      :width="520"
      :visible="viewVisible"
      @update:visible="(v) => (viewVisible = v)"
      :title="$t('content.view')"
    >
      <div v-if="viewRow" class="flex flex-col gap-4 text-sm">
        <!-- Sarlavha + tavsif + holat -->
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h4 class="truncate text-base font-semibold text-textColor0">
              {{ viewRow.title || '—' }}
            </h4>
            <p v-if="viewRow.message" class="mt-1 whitespace-pre-line text-sm text-textColor2">
              {{ viewRow.message }}
            </p>
          </div>
          <n-tag :type="statusView(viewRow.status).type" size="small" round class="shrink-0">
            {{ statusView(viewRow.status).label }}
          </n-tag>
        </div>

        <!-- Xato bo'lsa — tushunarli xabar banneri -->
        <div v-if="viewRow.error" class="rounded-lg bg-error/10 px-3 py-2 text-xs text-error">
          {{ friendlyError(viewRow.error) }}
        </div>

        <div class="kv-card">
          <div class="kv-row">
            <span class="kv-label">
              <n-icon size="13"><Globe20Regular /></n-icon>
              {{ $t('notificationPage.channel') }}
            </span>
            <span class="kv-val">{{ channelLabel(viewRow) }}</span>
          </div>
          <div class="kv-row">
            <span class="kv-label">
              <n-icon size="13"><Person20Regular /></n-icon>
              {{ $t('notificationPage.recipients') }}
            </span>
            <span class="kv-val">{{ viewRow.recipients }}</span>
          </div>
          <div class="kv-row">
            <span class="kv-label">
              <n-icon size="13"><DocumentCheckmark20Regular /></n-icon>
              {{ $t('notificationPage.push') }}
            </span>
            <span class="kv-val">
              <span class="font-semibold text-success">{{ viewRow.fcm_sent }}</span>
              <span v-if="viewRow.fcm_failed" class="text-error">
                &nbsp;/ {{ viewRow.fcm_failed }}
              </span>
            </span>
          </div>
          <div class="kv-row">
            <span class="kv-label">
              <n-icon size="13"><CalendarLtr20Regular /></n-icon>
              {{ $t('notificationPage.sendTime') }}
            </span>
            <span class="kv-val">{{ viewRow.scheduled_at || '—' }}</span>
          </div>
          <div class="kv-row">
            <span class="kv-label">
              <n-icon size="13"><CalendarLtr20Regular /></n-icon>
              {{ $t('notificationPage.sentAt') }}
            </span>
            <span class="kv-val">{{ viewRow.sent_at || '—' }}</span>
          </div>
          <div class="kv-row">
            <span class="kv-label">
              <n-icon size="13"><Person20Regular /></n-icon>
              {{ $t('notificationPage.sender') }}
            </span>
            <span class="kv-val">
              <UIUser
                v-if="viewRow.sender"
                :data="{
                  lastName: viewRow.sender.last_name,
                  firstName: viewRow.sender.first_name,
                  middleName: viewRow.sender.middle_name
                }"
              />
              <span v-else>—</span>
            </span>
          </div>
        </div>
      </div>
    </UIModal>
  </div>
</template>

<style scoped>
  .kv-card {
    border: 1px solid var(--surface-line);
    border-radius: 12px;
    overflow: hidden;
  }

  .kv-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    background: var(--surface-section);
    border-bottom: 1px solid var(--surface-line);
  }

  .kv-row:last-child {
    border-bottom: none;
  }

  .kv-label {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    font-size: 12px;
    color: var(--textColor2);
  }

  .kv-val {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    min-width: 0;
    font-size: 13px;
    font-weight: 500;
    color: var(--textColor0);
    text-align: right;
  }
</style>
