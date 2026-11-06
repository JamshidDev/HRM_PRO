<script setup>
  import { TIMESHEET_APPROVAL_ENABLED } from '../approval.js'
  import { UIStatus, UITable } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import {
    useAccountStore,
    useTimesheetStore,
    useTimesheetWorkerStore
  } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import {
    CheckmarkCircle24Filled,
    Delete16Regular,
    Send24Regular,
    Eye16Regular,
    LockClosed20Regular,
    LockOpen20Regular
  } from '@vicons/fluent'

  const { t } = i18n.global

  // Oy nomi interfeys tilida — dayjs locale'i global o'rnatilmagan, `format('MMMM')` inglizcha qaytaradi.
  const monthName = (month) => Utils.monthList.find((v) => v.id === month)?.name ?? ''

  const store = useTimesheetStore()
  const accStore = useAccountStore()
  const timesheetWorkerStore = useTimesheetWorkerStore()

  const onView = (row) => {
    // Har tabel toza filtr bilan ochiladi — bo'lim tanlovi oldingi korxonadan
    // qolib ketmasin.
    timesheetWorkerStore.resetForTimesheet()
    timesheetWorkerStore.timekeeperMode = false
    timesheetWorkerStore.elementId = row.id
    // Qulf holati ro'yxatdan olinadi — «Tabelchilar» tabida ruxsat shunga qarab
    // ko'rsatiladi (yakunlangan yoki yuborilgan tabel to'ldirilmaydi).
    timesheetWorkerStore.lock = {
      status: Boolean(row?.status),
      sent_at: row?.sent_at ?? null,
      confirmation: row?.confirmation?.id ?? null,
      locked: Boolean(row?.locked)
    }
    timesheetWorkerStore.visible = true
    timesheetWorkerStore._index()
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrTableDelete)) return
    store.elementId = row.id
    store._delete()
  }

  // Ogohlantirish aniq bo'lishi kerak: hujjat bilan birga o'sha oyning
  // to'ldirilgan kunlari ham o'chadi.
  const deleteWarning = (row) =>
    row?.workers_count
      ? t('timesheetPage.deleteWarning.filled', {
          month: `${row.year} ${monthName(row.month)}`,
          count: row.workers_count
        })
      : t('timesheetPage.deleteWarning.empty')

  // Yuborilgan (va hali rad etilmagan) tabel qayta yuborilmaydi.
  const isSent = (row) => Boolean(row?.sent_at) && row?.confirmation?.id !== 4
  const isConfirmed = (row) => row?.confirmation?.id === 3 || Boolean(row?.status)

  const onSend = (row) => {
    if (!accStore.checkAction(accStore.pn.hrTableWrite)) return
    if (isSent(row) || isConfirmed(row)) return
    store.elementId = row.id
    store.sendVisible = true
  }

  // Yopish/ochish faqat `hr-table-lock` ruxsati bor HR'ga; tabelchi ko'rmaydi.
  const canLock = (row) =>
    Boolean(row?.can_lock) && accStore.checkPermission(accStore.pn.hrTableLock) && !row?.status
  const onLock = (row) => store._setLock(row, !row.locked)

  // Tabel holati — tabel oynasidagi chip bilan bir xil tartib (`Timesheet.vue` `timesheetStatus`):
  // yakunlangan → tasdiqlashga yuborilgan → yopilgan → ochiq. Ilgari ochiq tabelda katak bo'sh qolardi.
  const STATE = {
    finished: { label: 'timesheetPage.accessFinished', tone: 'green', icon: CheckmarkCircle24Filled },
    sent: { label: 'timesheetPage.accessSent', tone: 'brand', icon: Send24Regular },
    locked: { label: 'timesheetPage.lockedTag', tone: 'amber', icon: LockClosed20Regular },
    open: { label: 'timesheetPage.statusOpen', tone: 'neutral', icon: LockOpen20Regular }
  }
  const TONE_CLASS = {
    green: 'bg-fig-chip-green text-fig-chip-green-text',
    brand: 'bg-fig-chip-brand text-fig-chip-brand-text',
    amber: 'bg-fig-chip-amber text-fig-chip-amber-text',
    neutral: 'bg-fig-bg-disable text-fig-text-tertiary'
  }
  const stateOf = (row) => {
    if (row?.status) return STATE.finished
    if (isSent(row)) return STATE.sent
    if (row?.locked) return STATE.locked
    return STATE.open
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // Hamma ustun `minWidth` — bo'sh joy ustunlar orasida teng bo'linadi.
  // Yil + Oy bitta «Davr» ustuniga birlashdi («Aprel 2026»).
  const columns = computed(() => [
    {
      key: 'work_place',
      title: t('timesheetWorkerPage.work_place'),
      minWidth: 320
    },
    {
      key: 'period',
      title: t('timesheetPage.periodLabel'),
      minWidth: 150
    },
    {
      // `workers_count` — shu oyda kunlari to'ldirilgan xodimlar soni (o'chirish ogohlantirishi ham shuni oladi).
      key: 'workers_count',
      title: t('timesheetPage.filledWorkers'),
      minWidth: 150
    },
    {
      key: 'status',
      title: t('timesheet.status'),
      minWidth: 200
    },
    ...(TIMESHEET_APPROVAL_ENABLED
      ? [{ key: 'confirmation', title: t('content.status'), minWidth: 140, align: 'center' }]
      : [])
  ])

  // Uch amal yetarli: ko'rish, o'chirish va HR tasdig'i (tasdiqlashga yuborish).
  // Tahrirlash `Ko'rish` oynasida, kelishuvchilar esa o'sha yerdagi kartochkada.
  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onView
    },
    {
      // Kelishuvga yuborilgan, lekin hali TO'LIQ tasdiqlanmagan tabel
      // o'chirilishi mumkin — server ham shu shartni qo'yadi.
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete16Regular),
      visible: (row) => !isConfirmed(row),
      action: onDelete
    },
    {
      label: t('content.confirm'),
      key: Utils.ActionTypes.send,
      icon: UIHelper.renderIcon(Send24Regular),
      visible: (row) => TIMESHEET_APPROVAL_ENABLED && !isSent(row) && !isConfirmed(row),
      action: onSend
    },
    {
      label: t('timesheetPage.lockClose'),
      key: Utils.ActionTypes.finish,
      icon: UIHelper.renderIcon(LockClosed20Regular),
      visible: (row) => canLock(row) && !row.locked,
      action: onLock
    },
    {
      label: t('timesheetPage.lockOpen'),
      key: Utils.ActionTypes.open,
      icon: UIHelper.renderIcon(LockOpen20Regular),
      visible: (row) => canLock(row) && row.locked,
      action: onLock
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-table"
    :delete-warning="deleteWarning"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-timesheet-list"
    @change-page="changePage"
  >
    <template #cell-work_place="{ row }">
      {{ row.department?.name || row.work_place?.name }}
    </template>

    <template #cell-period="{ row }">
      {{ monthName(row.month) }} {{ row.year }}
    </template>

    <template #cell-workers_count="{ row }">
      <span v-if="row.workers_count">
        {{ $t('timesheetPage.filledCount', { count: row.workers_count }) }}
      </span>
      <span v-else class="text-textColor3">{{ $t('timesheetPage.notFilled') }}</span>
    </template>

    <template #cell-status="{ row }">
      <span
        class="inline-flex max-w-full items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold leading-4"
        :class="TONE_CLASS[stateOf(row).tone]"
      >
        <n-icon :component="stateOf(row).icon" size="14" class="shrink-0" />
        <span class="truncate">{{ $t(stateOf(row).label) }}</span>
      </span>
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus :status="row.confirmation" />
    </template>
  </UITable>
</template>
