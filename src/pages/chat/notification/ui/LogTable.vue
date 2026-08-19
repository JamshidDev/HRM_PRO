<script setup>
  import { UITable, UIUser, UIModal } from '@components'
  import { useNotificationStore } from '@stores'
  import { Utils } from '@utils'
  import i18n from '@/i18n/index.js'
  import { NIcon } from 'naive-ui'
  import { MoreHorizontal24Regular, Eye16Regular, DismissCircle16Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useNotificationStore()

  const renderIcon = (icon) => () => h(NIcon, null, { default: () => h(icon) })

  // Har qatorning action menyusi (Ko'rish doim, Bekor faqat scheduled).
  const rowOptions = (row) => {
    const opts = [{ label: t('content.view'), key: 'view', icon: renderIcon(Eye16Regular) }]
    if (row.status === 'scheduled') {
      opts.push({ label: t('content.cancel'), key: 'cancel', icon: renderIcon(DismissCircle16Regular) })
    }
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

  const changePage = (v) => {
    store.pushLogsParams.page = v.page
    store.pushLogsParams.per_page = v.per_page
    store._push_logs()
  }

  // Backend 6 holatni 4 ta ko'rinadigan holatga (badge) xaritalash.
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

  // kanal/topic yorlig'i
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
    if (e.includes('not_configured'))
      return 'FCM serverda sozlanmagan'
    if (e.includes('no_access_token') || e.includes('unauthenticated') || e.includes('auth'))
      return 'FCM autentifikatsiya xatosi (server kaliti)'
    if (e.includes('quota') || e.includes('rate') || e.includes('unavailable'))
      return "Limit oshdi yoki xizmat vaqtincha ishlamayapti, keyinroq urinib ko'ring"
    if (e.includes('invalid') || e.includes('bad request'))
      return "Xabar formati noto'g'ri"
    return err // noma'lum — asl matnni ko'rsatamiz
  }

  // Ustunlar kontentga sig'adigan qilib qisqartirildi (jami ~900px, cho'zilmaydi):
  // sarlavha+xabar bitta ustunда, rejalashtirilgan/yuborilgan vaqt bitta "Vaqt"да.
  const columns = computed(() => [
    { key: 'title', title: t('content.title'), minWidth: 220, ellipsis: false },
    { key: 'channel', title: t('notificationPage.channel'), width: 130 },
    { key: 'recipients', title: t('notificationPage.recipients'), width: 120, align: 'center' },
    { key: 'status', title: t('content.status'), width: 120, align: 'center' },
    { key: 'time', title: t('notificationPage.sentAt'), width: 150 },
    { key: 'sender', title: t('notificationPage.sender'), minWidth: 160 },
    { key: 'actions', title: '', width: 56, align: 'center' }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :data="store.pushLogs"
    :loading="store.pushLogsLoading"
    :page="store.pushLogsParams.page"
    :per-page="store.pushLogsParams.per_page"
    :total="store.pushLogsTotal"
    storage-key="chat-push-logs"
    @change-page="changePage"
  >
    <template #cell-sender="{ row }">
      <UIUser
        v-if="row.sender"
        :data="{
          lastName: row.sender.last_name,
          firstName: row.sender.first_name,
          middleName: row.sender.middle_name
        }"
      />
      <span v-else>—</span>
    </template>

    <!-- Sarlavha + xabar (ikki qatorli, joy tejaydi) -->
    <template #cell-title="{ row }">
      <div class="min-w-0 max-w-[320px]">
        <div class="truncate font-medium">{{ row.title || '—' }}</div>
        <div v-if="row.message" class="truncate text-xs text-gray-400">{{ row.message }}</div>
      </div>
    </template>

    <template #cell-channel="{ row }">
      {{ channelLabel(row) }}
    </template>

    <template #cell-status="{ row }">
      <!-- Xato bo'lsa — badge ustиga hover qilganда error message tooltipда. -->
      <n-tooltip
        v-if="statusView(row.status).type === 'error' && row.error"
        trigger="hover"
        placement="top"
      >
        <template #trigger>
          <n-tag type="error" size="small" round class="cursor-help">
            {{ statusView(row.status).label }}
          </n-tag>
        </template>
        <span class="max-w-xs break-words">{{ friendlyError(row.error) }}</span>
      </n-tooltip>
      <n-tag v-else :type="statusView(row.status).type" size="small" round>
        {{ statusView(row.status).label }}
      </n-tag>
    </template>

    <!-- Vaqt: rejalashtirilgan (kutilmoqda) bo'lsa scheduled_at, aks holda sent_at -->
    <template #cell-time="{ row }">
      <span
        v-if="row.status === 'scheduled' || row.status === 'sending'"
        class="whitespace-nowrap text-info"
      >
        {{ row.scheduled_at ? Utils.timeHHMMWithMonth(row.scheduled_at) : '—' }}
      </span>
      <span v-else class="whitespace-nowrap">
        {{ row.sent_at ? Utils.timeHHMMWithMonth(row.sent_at) : '—' }}
      </span>
    </template>

    <template #cell-actions="{ row }">
      <n-dropdown
        trigger="click"
        :options="rowOptions(row)"
        @select="(key) => onAction(key, row)"
      >
        <n-button quaternary circle size="small">
          <template #icon>
            <n-icon><MoreHorizontal24Regular /></n-icon>
          </template>
        </n-button>
      </n-dropdown>
    </template>
  </UITable>

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
        <span class="text-error text-right">{{ friendlyError(viewRow.error) }}</span>
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
        <span v-if="viewRow.sender">
          {{ viewRow.sender.last_name }} {{ viewRow.sender.first_name }}
        </span>
        <span v-else>—</span>
      </div>
    </div>
  </UIModal>
</template>
