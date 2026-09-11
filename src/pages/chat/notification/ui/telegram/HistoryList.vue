<script setup>
  // Telegram broadcast tarixi — «nechtadan nechtasi yuborildi, nechtasi bloklandi».
  import { UIUser, UIModal } from '@components'
  import { useTelegramBroadcastStore } from '@stores'
  import { Utils } from '@utils'
  import i18n from '@/i18n/index.js'
  import { MoreHorizontal24Regular } from '@vicons/fluent'
  import DOMPurify from 'dompurify'
  import { telegramHtmlToPreview } from '@/utils/telegramHtml.js'

  const { t } = i18n.global
  const store = useTelegramBroadcastStore()

  const statusFilterOptions = computed(() =>
    ['scheduled', 'sending', 'done', 'cancelled', 'failed'].map((value) => ({
      label: t(`telegramBroadcast.st.${value}`),
      value
    }))
  )

  const STATUS_TYPE = {
    scheduled: 'info',
    sending: 'warning',
    done: 'success',
    cancelled: 'default',
    failed: 'error'
  }
  const statusLabel = (s) => t(`telegramBroadcast.st.${s}`)
  const statusType = (s) => STATUS_TYPE[s] ?? 'default'
  const dotClass = (s) =>
    ({
      info: 'bg-info',
      warning: 'bg-warning',
      success: 'bg-success',
      error: 'bg-error',
      default: 'bg-gray-300'
    })[statusType(s)]

  const audienceLabel = (row) => t(`telegramBroadcast.audience.${row.audience}`)

  // Matn Telegram HTML'ida saqlanadi — modalda formatlab ko'rsatamiz.
  // Mazmun o'z API'mizdan kelsa ham `DOMPurify` bilan teglar cheklanadi.
  const renderMessage = (html) =>
    DOMPurify.sanitize(telegramHtmlToPreview(html || ''), {
      ALLOWED_TAGS: ['b', 'i', 'u', 's', 'a', 'code', 'pre', 'blockquote', 'span', 'br'],
      ALLOWED_ATTR: ['href', 'class']
    })

  const rowTime = (row) =>
    row.status === 'scheduled' ? row.scheduled_at : row.finished_at || row.started_at

  const rowOptions = (row) => {
    const opts = [{ label: t('content.view'), key: 'view' }]
    if (row.status === 'scheduled' || row.status === 'sending') {
      opts.push({ label: t('content.cancel'), key: 'cancel' })
    }
    return opts
  }

  const viewVisible = ref(false)
  const onAction = (key, row) => {
    if (key === 'view') {
      store._show(row.id)
      viewVisible.value = true
    } else if (key === 'cancel') {
      store._cancel(row.id)
    }
  }

  const onStatusFilter = (v) => {
    store.params.status = v ?? null
    store.params.page = 1
    store._index()
  }

  const changePage = (page) => {
    store.params.page = page
    store._index()
  }

  // Ketayotgan broadcast bor ekan — ro'yxat o'zi yangilanib turadi (progress jonli).
  let poller = null
  const hasRunning = computed(() => store.list.some((r) => r.status === 'sending'))
  watch(
    hasRunning,
    (running) => {
      clearInterval(poller)
      if (running) poller = setInterval(() => store._index(), 5000)
    },
    { immediate: true }
  )
  onUnmounted(() => clearInterval(poller))
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="mb-3 flex shrink-0 items-center justify-between gap-3">
      <span class="truncate text-sm font-semibold text-gray-500">
        {{ $t('telegramBroadcast.sentList') }}
      </span>
      <div class="w-44 shrink-0">
        <n-select
          size="small"
          clearable
          :value="store.params.status"
          :options="statusFilterOptions"
          :placeholder="$t('content.all')"
          @update:value="onStatusFilter"
        />
      </div>
    </div>

    <n-spin :show="store.loading" class="tg-history__spin min-h-0 flex-1">
      <div v-if="store.list.length" class="flex h-full flex-col overflow-y-auto pr-1">
        <div
          v-for="row in store.list"
          :key="row.id"
          class="group shrink-0 border-b border-surface-line px-1 py-3 transition-colors last:border-0 hover:bg-info/5"
        >
          <div class="flex items-start gap-2">
            <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full" :class="dotClass(row.status)" />
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <div class="truncate font-medium">{{ row.message_preview || '—' }}</div>
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

              <!-- «Nechtadan nechtasi» — asosiy ko'rsatkich -->
              <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                <n-tag :type="statusType(row.status)" size="tiny" round>
                  {{ statusLabel(row.status) }}
                </n-tag>
                <span>{{ audienceLabel(row) }}</span>
                <span>
                  ·
                  <span class="text-success font-medium">{{ row.sent }}</span>
                  / {{ row.total }} {{ $t('telegramBroadcast.sentOf') }}
                </span>
                <span v-if="row.blocked" class="text-warning">
                  · {{ row.blocked }} {{ $t('telegramBroadcast.blocked') }}
                </span>
                <span v-if="row.failed" class="text-error">
                  · {{ row.failed }} {{ $t('telegramBroadcast.failed') }}
                </span>
                <span v-if="rowTime(row)" class="ml-auto whitespace-nowrap">
                  {{ Utils.timeHHMMWithMonth(rowTime(row)) }}
                </span>
              </div>

              <n-progress
                v-if="row.status === 'sending'"
                class="mt-2"
                type="line"
                :percentage="row.progress"
                :height="4"
                :show-indicator="false"
                processing
              />
            </div>
          </div>
        </div>
      </div>

      <n-empty v-else class="py-10" />
    </n-spin>

    <div v-if="store.total > store.params.per_page" class="mt-3 flex shrink-0 justify-end">
      <n-pagination
        :page="store.params.page"
        :page-size="store.params.per_page"
        :item-count="store.total"
        @update:page="changePage"
      />
    </div>

    <UIModal
      :width="600"
      :visible="viewVisible"
      @update:visible="(v) => (viewVisible = v)"
      :title="$t('content.view')"
    >
      <n-spin :show="store.viewLoading">
        <div v-if="store.viewRow" class="grid grid-cols-1 gap-2 text-sm">
          <div class="flex justify-between border-b pb-1">
            <span class="text-gray-500">{{ $t('content.status') }}</span>
            <n-tag :type="statusType(store.viewRow.status)" size="small" round>
              {{ statusLabel(store.viewRow.status) }}
            </n-tag>
          </div>
          <div class="flex justify-between border-b pb-1">
            <span class="text-gray-500">{{ $t('telegramBroadcast.audienceLabel') }}</span>
            <span>{{ audienceLabel(store.viewRow) }}</span>
          </div>
          <div class="flex justify-between border-b pb-1">
            <span class="text-gray-500">{{ $t('telegramBroadcast.result') }}</span>
            <span>
              <span class="text-success">{{ store.viewRow.sent }}</span>
              / {{ store.viewRow.total }}
              <span v-if="store.viewRow.blocked" class="text-warning">
                · {{ store.viewRow.blocked }} {{ $t('telegramBroadcast.blocked') }}
              </span>
              <span v-if="store.viewRow.failed" class="text-error">
                · {{ store.viewRow.failed }} {{ $t('telegramBroadcast.failed') }}
              </span>
            </span>
          </div>
          <!-- Qamrov: botga ulanganlar / jami shtatdagi xodimlar -->
          <div v-if="store.viewRow.staff_total" class="flex justify-between border-b pb-1">
            <span class="text-gray-500">{{ $t('telegramBroadcast.coverage') }}</span>
            <span>
              {{ store.viewRow.total }} / {{ store.viewRow.staff_total }}
              <span class="text-gray-400">
                ({{ Math.round((store.viewRow.total / store.viewRow.staff_total) * 100) }}%)
              </span>
            </span>
          </div>
          <div class="border-b pb-1">
            <div class="mb-1 text-gray-500">{{ $t('telegramBroadcast.messageText') }}</div>
            <div class="tg-message" v-html="renderMessage(store.viewRow.message?.uz)" />
            <div
              v-if="store.viewRow.message?.ru"
              class="tg-message mt-1 text-gray-500"
              v-html="renderMessage(store.viewRow.message.ru)"
            />
            <div
              v-if="store.viewRow.message?.en"
              class="tg-message mt-1 text-gray-500"
              v-html="renderMessage(store.viewRow.message.en)"
            />
          </div>
          <div class="flex justify-between border-b pb-1">
            <span class="text-gray-500">{{ $t('notificationPage.sendTime') }}</span>
            <span>{{ store.viewRow.scheduled_at || '—' }}</span>
          </div>
          <div class="flex justify-between border-b pb-1">
            <span class="text-gray-500">{{ $t('telegramBroadcast.startedAt') }}</span>
            <span>{{ store.viewRow.started_at || '—' }}</span>
          </div>
          <div class="flex justify-between border-b pb-1">
            <span class="text-gray-500">{{ $t('telegramBroadcast.finishedAt') }}</span>
            <span>{{ store.viewRow.finished_at || '—' }}</span>
          </div>
          <div class="flex justify-between border-b pb-1">
            <span class="text-gray-500">{{ $t('notificationPage.sender') }}</span>
            <UIUser
              v-if="store.viewRow.sender"
              :data="{
                lastName: store.viewRow.sender.last_name,
                firstName: store.viewRow.sender.first_name,
                middleName: store.viewRow.sender.middle_name
              }"
            />
            <span v-else>—</span>
          </div>
          <!-- Nega yetmagani: oxirgi 10 ta xato (bloklagan / topilmagan chat) -->
          <div v-if="store.viewRow.last_errors?.length">
            <div class="mb-1 text-gray-500">{{ $t('telegramBroadcast.lastErrors') }}</div>
            <div
              v-for="(e, idx) in store.viewRow.last_errors"
              :key="idx"
              class="truncate text-xs text-gray-400"
            >
              {{ e.chat_id }} — {{ e.error }}
            </div>
          </div>
        </div>
      </n-spin>
    </UIModal>
  </div>
</template>

<style scoped>
  .tg-history__spin :deep(.n-spin-content) {
    height: 100%;
  }
  .tg-message :deep(code) {
    background: rgb(0 0 0 / 6%);
    border-radius: 4px;
    padding: 0 4px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .tg-message :deep(blockquote) {
    border-left: 3px solid var(--color-info, #3b82f6);
    margin: 4px 0;
    padding-left: 8px;
  }
  .tg-message :deep(.tg-spoiler) {
    background: rgb(0 0 0 / 18%);
    border-radius: 3px;
  }
</style>
