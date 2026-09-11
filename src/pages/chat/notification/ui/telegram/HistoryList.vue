<script setup>
  // Telegram broadcast tarixi — Push tarixi bilan bir xil uslubda (UITable).
  // Asosiy ko'rsatkich: «nechtadan nechtasi yuborildi, nechtasi bloklandi».
  import { UIUser, UIModal, UITable } from '@components'
  import { useTelegramBroadcastStore } from '@stores'
  import { Utils } from '@utils'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'
  import DOMPurify from 'dompurify'
  import { telegramHtmlToPreview } from '@/utils/telegramHtml.js'
  import {
    Eye24Regular,
    ArrowSync16Regular,
    Dismiss24Regular,
    People20Regular,
    CheckmarkCircle20Regular,
    ErrorCircle20Regular,
    Clock20Regular,
    Send20Regular,
    CalendarLtr20Regular,
    Person20Regular,
    Prohibited20Regular
  } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useTelegramBroadcastStore()

  const STATUSES = ['scheduled', 'sending', 'done', 'cancelled', 'failed']
  const statusFilterOptions = computed(() =>
    STATUSES.map((value) => ({ label: t(`telegramBroadcast.st.${value}`), value }))
  )

  const STATUS_TYPE = {
    scheduled: 'info',
    sending: 'warning',
    done: 'success',
    cancelled: 'error',
    failed: 'error'
  }
  const statusLabel = (s) => t(`telegramBroadcast.st.${s}`)
  const statusType = (s) => STATUS_TYPE[s] ?? 'default'
  const dotClass = (s) =>
    ({
      info: 'bg-info',
      warning: 'bg-warning',
      success: 'bg-success',
      error: 'bg-danger',
      default: 'bg-gray-300'
    })[statusType(s)]

  const audienceLabel = (row) => t(`telegramBroadcast.audience.${row.audience}`)

  // «2316 / 15532» o'qilishi qiyin — ming ajratgich + foiz + tooltip bilan beramiz.
  const num = (v) => String(v ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  const percent = (row) => (row.total > 0 ? Math.round((row.sent / row.total) * 100) : 0)
  // Progress rangi holatga bog'liq: bekor qilinganda yashil "bajarildi"
  // belgisi chalg'itadi (yuborish to'liq tugamagan).
  const progressStatus = (row) =>
    ({ sending: 'warning', done: 'success', failed: 'error' })[row.status] ?? 'default'

  const resultHint = (row) =>
    t('telegramBroadcast.resultHint', { total: num(row.total), sent: num(row.sent) })

  // Matn Telegram HTML'ida saqlanadi — modalda formatlab ko'rsatamiz.
  const renderMessage = (html) =>
    DOMPurify.sanitize(telegramHtmlToPreview(html || ''), {
      ALLOWED_TAGS: ['b', 'i', 'u', 's', 'a', 'code', 'pre', 'blockquote', 'span', 'br'],
      ALLOWED_ATTR: ['href', 'class']
    })

  // Sana ko'rinishi: `DD.MM.YYYY` + ostida soat (jadval), modalda bitta qatorda.
  const fmtDate = (v) => Utils.timeOnlyDate(v) ?? '—'
  const fmtTime = (v) => Utils.timeOnlyHour(v) ?? ''
  const fmtDateTime = (v) => (v ? `${Utils.timeOnlyDate(v)} ${Utils.timeOnlyHour(v)}` : '—')

  const rowTime = (row) =>
    row.status === 'scheduled' ? row.scheduled_at : row.finished_at || row.started_at

  const isRunning = (row) => row.status === 'scheduled' || row.status === 'sending'

  const viewVisible = ref(false)
  const openView = (row) => {
    store._show(row.id)
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
      visible: isRunning,
      action: (row) => store._cancel(row.id)
    }
  ])

  const columns = computed(() => [
    { key: 'status', title: t('content.status'), width: 150 },
    { key: 'message', title: t('telegramBroadcast.messageText'), minWidth: 180 },
    { key: 'audience', title: t('telegramBroadcast.audienceLabel'), width: 170 },
    { key: 'result', title: t('telegramBroadcast.result'), width: 120, align: 'center' },
    { key: 'blocked', title: t('telegramBroadcast.blockedColumn'), width: 100, align: 'center' },
    // Sana ustuni oxirgi — amallar ustuni «sticky» bo'lgani uchun zaxira kenglik.
    { key: 'time', title: t('content.date'), width: 130 }
  ])

  // Ketayotgan qator: butun qator bo'ylab fon + pastida progress chizig'i.
  // Foiz qiymati CSS'ga sinf orqali uzatiladi (`rowClassName` faqat sinf qaytaradi,
  // inline style bermaydi) — 5% qadamli 21 ta sinf yetarli aniqlik beradi.
  const rowClassName = (row) => (row.status === 'sending' ? 'tg-row-sending' : '')

  // Progress qatorning BUTUN kengligi bo'ylab chiziladi: yo'lak birinchi
  // katak ichida, lekin `tr` ga nisbatan absolyut joylashgani uchun qator
  // bo'ylab cho'ziladi (foiz katakka emas, qatorga nisbatan hisoblanadi).
  const progressWidth = (row) => `${Math.min(100, Math.max(0, row.progress ?? 0))}%`

  const onStatusFilter = (v) => {
    store.params.status = v ?? null
    store.params.page = 1
    store._index()
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

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

    <!-- `UITable` `inheritAttrs: false` — balandlikni o'rovchi div beradi. -->
    <div class="min-h-0 flex-1">
      <UITable
        :columns="columns"
        :actions="rowActions"
        :data="store.list"
        :loading="store.loading"
        :page="store.params.page"
        :per-page="store.params.per_page"
        :total="store.total"
        :show-index="false"
        :row-class-name="rowClassName"
        storage-key="chat-telegram-broadcast-history"
        @change-page="changePage"
        @row-click="openView"
      >
        <template #cell-status="{ row }">
          <template v-if="row.status === 'sending'">
            <span class="tg-track" />
            <span class="tg-fill" :style="{ width: progressWidth(row) }" />
          </template>
          <n-tag
            :type="statusType(row.status)"
            size="small"
            round
            :bordered="false"
          >
            <template v-if="row.status === 'sending'" #icon>
              <n-icon class="animate-spin"><ArrowSync16Regular /></n-icon>
            </template>
            {{ statusLabel(row.status) }}
          </n-tag>
        </template>

        <template #cell-message="{ row }">
          <div class="min-w-0">
            <div class="flex min-w-0 items-center gap-2">
              <span class="h-2 w-2 shrink-0 rounded-full" :class="dotClass(row.status)" />
              <span class="truncate font-medium text-textColor0">
                {{ row.message_preview || '—' }}
              </span>
            </div>
          </div>
        </template>

        <template #cell-audience="{ row }">
          <n-tag
            :type="row.audience === 'all_staff' ? 'info' : 'default'"
            size="small"
            round
            :bordered="false"
          >
            {{ audienceLabel(row) }}
          </n-tag>
        </template>

        <!-- «Nechtadan nechtasi» — asosiy ko'rsatkich -->
        <template #cell-result="{ row }">
          <!-- Rejalashtirilganda kadr hali olinmagan — `0 / 0` chalg'itadi. -->
          <span v-if="row.status === 'scheduled'" class="text-textColor3">—</span>
          <div v-else class="flex flex-wrap items-center justify-center gap-1">
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-tag type="success" size="small" round :bordered="false" @click.stop>
                  {{ num(row.sent) }}
                  <span class="opacity-60">/ {{ num(row.total) }}</span>
                </n-tag>
              </template>
              <span class="text-xs">{{ resultHint(row) }}</span>
            </n-tooltip>
            <n-tooltip v-if="row.failed" trigger="hover">
              <template #trigger>
                <n-tag type="error" size="small" round :bordered="false" @click.stop>
                  {{ row.failed }}
                </n-tag>
              </template>
              <span class="text-xs">{{ $t('telegramBroadcast.failed') }}</span>
            </n-tooltip>
          </div>
        </template>

        <!-- Botni bloklaganlar — alohida ustun. Nol bo'lsa katak BO'SH qoladi
             (badge ichida «0» ko'z tortadi, lekin hech qanday ma'no bermaydi). -->
        <template #cell-blocked="{ row }">
          <n-tag v-if="row.blocked" type="error" size="small" round :bordered="false">
            {{ num(row.blocked) }}
          </n-tag>
        </template>

        <template #cell-time="{ row }">
          <div v-if="rowTime(row)" class="leading-tight">
            <div class="whitespace-nowrap text-textColor0">{{ fmtDate(rowTime(row)) }}</div>
            <div class="text-[11px] text-textColor3">{{ fmtTime(rowTime(row)) }}</div>
          </div>
          <span v-else class="text-textColor3">—</span>
        </template>
      </UITable>
    </div>

    <!-- Ko'rish modali — balandligi qat'iy, ichki qism skroll bo'ladi -->
    <UIModal
      :width="560"
      :visible="viewVisible"
      @update:visible="(v) => (viewVisible = v)"
      :title="$t('content.view')"
    >
      <n-spin :show="store.viewLoading">
        <div class="tg-view flex flex-col gap-3 text-sm">
          <template v-if="store.viewRow">
            <!-- 1. Sarlavha: holat + auditoriya + yaratilgan vaqt -->
            <div class="flex shrink-0 flex-wrap items-center gap-2">
              <n-tag
                :type="statusType(store.viewRow.status)"
                size="small"
                round
                :bordered="false"
              >
                <template v-if="store.viewRow.status === 'sending'" #icon>
                  <n-icon class="animate-spin"><ArrowSync16Regular /></n-icon>
                </template>
                {{ statusLabel(store.viewRow.status) }}
              </n-tag>
              <n-tag
                :type="store.viewRow.audience === 'all_staff' ? 'info' : 'default'"
                size="small"
                round
                :bordered="false"
              >
                {{ audienceLabel(store.viewRow) }}
              </n-tag>
              <span class="ml-auto text-xs text-textColor3">
                {{ fmtDateTime(store.viewRow.created_at) }}
              </span>
            </div>

            <!-- 2. Ko'rsatkichlar — ikonka + qiymat + izoh -->
            <div class="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">
              <div class="tg-stat tg-stat--success">
                <n-icon class="tg-stat__icon text-success" size="14">
                  <CheckmarkCircle20Regular />
                </n-icon>
                <div class="tg-stat__val text-success">{{ num(store.viewRow.sent) }}</div>
                <div class="tg-stat__label">{{ $t('telegramBroadcast.sentOf') }}</div>
              </div>
              <div class="tg-stat tg-stat--muted">
                <n-icon class="tg-stat__icon text-textColor2" size="14">
                  <People20Regular />
                </n-icon>
                <div class="tg-stat__val">{{ num(store.viewRow.total) }}</div>
                <div class="tg-stat__label">{{ $t('telegramBroadcast.recipientsShort') }}</div>
              </div>
              <div
                class="tg-stat"
                :class="store.viewRow.blocked ? 'tg-stat--error' : 'tg-stat--empty'"
              >
                <n-icon
                  class="tg-stat__icon"
                  :class="store.viewRow.blocked ? 'text-danger' : 'text-textColor3'"
                  size="14"
                >
                  <Prohibited20Regular />
                </n-icon>
                <div class="tg-stat__val" :class="store.viewRow.blocked ? 'text-danger' : ''">
                  {{ store.viewRow.blocked ? num(store.viewRow.blocked) : '—' }}
                </div>
                <div class="tg-stat__label">{{ $t('telegramBroadcast.blockedColumn') }}</div>
              </div>
              <div
                class="tg-stat"
                :class="store.viewRow.failed ? 'tg-stat--error' : 'tg-stat--empty'"
              >
                <n-icon
                  class="tg-stat__icon"
                  :class="store.viewRow.failed ? 'text-danger' : 'text-textColor3'"
                  size="14"
                >
                  <ErrorCircle20Regular />
                </n-icon>
                <div class="tg-stat__val" :class="store.viewRow.failed ? 'text-danger' : ''">
                  {{ store.viewRow.failed ? num(store.viewRow.failed) : '—' }}
                </div>
                <div class="tg-stat__label">{{ $t('telegramBroadcast.failed') }}</div>
              </div>
            </div>

            <!-- 3. Progress + qamrov -->
            <div v-if="store.viewRow.total > 0" class="shrink-0">
              <n-progress
                type="line"
                :percentage="percent(store.viewRow)"
                :height="6"
                :border-radius="3"
                :processing="store.viewRow.status === 'sending'"
                :status="progressStatus(store.viewRow)"
                :show-indicator="false"
              />
            </div>

            <div
              v-if="store.viewRow.error"
              class="shrink-0 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger"
            >
              {{ store.viewRow.error }}
            </div>

            <!-- 4. Skroll qismi: vaqtlar → xatolar → xabar matni (oxirida, yig'iladigan) -->
            <div class="min-h-0 flex-1 overflow-y-auto pr-1">
              <div class="kv-card">
                <div v-if="store.viewRow.scheduled_at" class="kv-row">
                  <span class="kv-label">
                    <n-icon size="13"><CalendarLtr20Regular /></n-icon>
                    {{ $t('notificationPage.sendTime') }}
                  </span>
                  <span class="kv-val">{{ fmtDateTime(store.viewRow.scheduled_at) }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">
                    <n-icon size="13"><Send20Regular /></n-icon>
                    {{ $t('telegramBroadcast.startedAt') }}
                  </span>
                  <span class="kv-val">{{ fmtDateTime(store.viewRow.started_at) }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">
                    <n-icon size="13"><Clock20Regular /></n-icon>
                    {{ $t('telegramBroadcast.finishedAt') }}
                  </span>
                  <span class="kv-val">{{ fmtDateTime(store.viewRow.finished_at) }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-label">
                    <n-icon size="13"><Person20Regular /></n-icon>
                    {{ $t('notificationPage.sender') }}
                  </span>
                  <span class="kv-val">
                    <UIUser
                      v-if="store.viewRow.sender"
                      :short="false"
                      :hide-tooltip="true"
                      :avatar-clickable="false"
                      :data="{
                        photo: store.viewRow.sender.photo,
                        lastName: store.viewRow.sender.last_name,
                        firstName: store.viewRow.sender.first_name,
                        middleName: store.viewRow.sender.middle_name,
                        position: store.viewRow.sender.position
                      }"
                    />
                    <span v-else>—</span>
                  </span>
                </div>
              </div>

              <!-- Nega yetmagani -->
              <div v-if="store.viewRow.last_errors?.length" class="mt-3">
                <div class="mb-1 flex items-center gap-1 text-xs text-danger">
                  <n-icon size="13"><Prohibited20Regular /></n-icon>
                  {{ $t('telegramBroadcast.lastErrors') }}
                </div>
                <div class="rounded-lg border border-danger/25 bg-danger/5 px-3 py-2">
                  <div
                    v-for="(e, idx) in store.viewRow.last_errors"
                    :key="idx"
                    class="truncate text-xs text-danger"
                  >
                    <span class="opacity-70">{{ e.chat_id }}</span> — {{ e.error }}
                  </div>
                </div>
              </div>

              <!-- Xabar matni — oxirida, oddiy kartochkada -->
              <div class="mt-3">
                <div class="mb-1 flex items-center gap-1 text-xs text-primary">
                  <n-icon size="13"><Send20Regular /></n-icon>
                  {{ $t('telegramBroadcast.messageText') }}
                </div>
                <div class="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2">
                  <div
                    class="tg-message text-textColor0"
                    v-html="renderMessage(store.viewRow.message?.uz)"
                  />
                  <div
                    v-if="store.viewRow.message?.ru"
                    class="tg-message mt-2 border-t border-surface-line pt-2 text-textColor2"
                    v-html="renderMessage(store.viewRow.message.ru)"
                  />
                  <div
                    v-if="store.viewRow.message?.en"
                    class="tg-message mt-2 border-t border-surface-line pt-2 text-textColor2"
                    v-html="renderMessage(store.viewRow.message.en)"
                  />
                </div>
              </div>
            </div>
          </template>
        </div>
      </n-spin>
    </UIModal>
  </div>
</template>

<style scoped>
  /* Modal balandligi qat'iy — matn qisqa yoki uzun bo'lishidan qat'i nazar
     oyna sakramaydi, ortiqchasi ichkarida skroll bo'ladi. */
  .tg-view {
    height: 58vh;
    min-height: 380px;
    max-height: 560px;
  }

  .tg-stat {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    padding: 6px 4px 5px;
    border: 1px solid var(--surface-line);
    border-radius: 8px;
    background: var(--surface-section);
  }

  /* Har ko'rsatkich o'z rangida — ko'z bir qarashda ajratadi. */
  .tg-stat--success {
    border-color: color-mix(in srgb, var(--color-success) 30%, transparent);
    background: color-mix(in srgb, var(--color-success) 8%, transparent);
  }

  .tg-stat--error {
    border-color: color-mix(in srgb, var(--color-danger) 30%, transparent);
    background: color-mix(in srgb, var(--color-danger) 8%, transparent);
  }

  .tg-stat--muted {
    background: var(--surface-ground, rgb(0 0 0 / 3%));
  }

  /* Nol ko'rsatkich — kartochka so'nib turadi, raqam yozilmaydi. */
  .tg-stat--empty {
    opacity: 0.45;
  }

  .tg-stat__icon {
    margin-bottom: 1px;
  }

  .tg-stat__val {
    min-height: 16px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.15;
    color: var(--textColor0);
  }

  .tg-stat__label {
    font-size: 9px;
    line-height: 1.2;
    color: var(--textColor2);
    text-align: center;
  }

  /* Ketayotgan qator: fon o'zgarmaydi — faqat qatorning BUTUN kengligi bo'ylab
     pastda progress chizig'i. Chiziq har katakning fon-gradienti sifatida
     chiziladi, shuning uchun ustunlar orasida uzilmaydi. */
  /* Qator bo'ylab progress: `tr` — joylashuv tayanchi, yo'lak esa birinchi
     katak ichida, lekin `tr` ga nisbatan absolyut → butun qatorni egallaydi. */
  :deep(tr.tg-row-sending) {
    position: relative;
  }

  .tg-track,
  .tg-fill {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    border-radius: 2px;
    pointer-events: none;
  }

  .tg-track {
    width: 100%;
    background: var(--color-primary, #0ea5e9);
    opacity: 0.15;
  }

  .tg-fill {
    background-color: var(--color-primary, #0ea5e9);
    background-image: repeating-linear-gradient(
      90deg,
      rgb(255 255 255 / 45%) 0 8px,
      rgb(255 255 255 / 0%) 8px 16px
    );
    transition: width 0.4s ease;
    animation: tg-progress-stripes 0.9s linear infinite;
  }

  @keyframes tg-progress-stripes {
    from {
      background-position: 0 0;
    }
    to {
      background-position: 16px 0;
    }
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
  .tg-message :deep(a) {
    color: var(--color-info, #3b82f6);
    text-decoration: underline;
  }

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
    /* Barcha qatorlar bir xil balandlikda — yuboruvchi qatorida ism va uning
       ostidagi lavozim ikki qator bo'lgani uchun balandlik shunga moslangan. */
    min-height: 48px;
    padding: 0 14px;
    background: var(--surface-section);
    border-bottom: 1px solid var(--surface-line);
  }

  /* `UIUser` avatari kv-qatorga sig'sin. */
  .kv-val :deep(.n-avatar),
  .kv-val :deep(img) {
    width: 24px;
    height: 24px;
    min-width: 24px;
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
