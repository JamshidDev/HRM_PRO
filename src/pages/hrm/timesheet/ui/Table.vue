<script setup>
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
    Eye16Regular
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
    timesheetWorkerStore.elementId = row.id
    // Qulf holati ro'yxatdan olinadi — «Tabelchilar» tabida ruxsat shunga qarab
    // ko'rsatiladi (yakunlangan yoki yuborilgan tabel to'ldirilmaydi).
    timesheetWorkerStore.lock = {
      status: Boolean(row?.status),
      sent_at: row?.sent_at ?? null,
      confirmation: row?.confirmation?.id ?? null
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

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'work_place',
      title: t('timesheetWorkerPage.work_place'),
      minWidth: 500,
    },
    {
      key: 'year',
      title: t('content.year'),
      width: 100,
      align: 'center'
    },
    {
      key: 'month',
      title: t('content.month'),
      width: 140,
      align: 'left'
    },
    {
      key: 'status',
      title: t('timesheet.status'),
      width: 140,
      align: 'center'
    },
    {
      key: 'confirmation',
      title: t('content.status'),
      width: 140,
      align: 'center'
    }
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
      visible: (row) => !isSent(row) && !isConfirmed(row),
      action: onSend
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
    storage-key="hrm-timesheet-department"
    @change-page="changePage"
  >
    <template #cell-work_place="{ row }">
      {{ row.department?.name || row.work_place?.name }}
    </template>

    <template #cell-year="{ row }">
      {{ row.year }}
    </template>

    <template #cell-month="{ row }">
      {{ monthName(row.month) }}
    </template>

    <template #cell-status="{ row }">
      <n-button v-if="!!row?.status" type="primary" size="tiny" dashed>
        <template #icon>
          <n-icon :component="CheckmarkCircle24Filled" />
        </template>
        {{ $t('timesheet.finished') }}
      </n-button>
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus :status="row.confirmation" />
    </template>
  </UITable>
</template>
