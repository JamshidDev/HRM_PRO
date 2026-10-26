<script setup>
  import { UIBadge, UITable } from '@/components/index.js'
  import { useAccountStore, useShiftTypeStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { crewSizeOf } from '@/pages/turnstile/scheduleWorker/ui/navbat.js'
  import {
    CheckmarkCircle32Regular,
    Delete20Regular,
    Eye16Regular,
    OpenFolder24Filled
  } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useShiftTypeStore()
  const accStore = useAccountStore()
  const router = useRouter()

  const changePage = (v) => {
    store.groupParams.page = v.page
    store.groupParams.per_page = v.per_page
    store._group()
  }

  // Sana oralig'i va nomi query'da: sahifa refresh qilinganda ham grafik qayta quriladi.
  const onViewWorkers = (row) => {
    router.push({
      name: 'turnstile-shift-type-group-workers',
      params: { groupId: row.id },
      query: {
        name: row.name,
        start: row.start_date,
        end: row.end_date,
        // Generatsiyadagi o'rinlar soni — bo'sh o'rinlar ham ko'rinsin.
        slots: row.slots_count || undefined,
        type: row.schedule_type?.id || store.groupParams.schedule_type || undefined,
        // Ro'yxatda tanlangan oy — guruh shu oyda ochiladi.
        month:
          store.groupParams.year && store.groupParams.month
            ? `${store.groupParams.year}-${store.groupParams.month}`
            : undefined
      }
    })
  }

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsFinish)) return
    store.elementId = row.id
    store.groupId = row.id
    store.generatePayload.name = row.name
    store.generatePayload.start_date = Utils.datePickerFormatter(row.start_date)
    store.generatePayload.end_date = Utils.datePickerFormatter(row.end_date)
    store.isDailySchedule = false
    store.visibleType = false
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsDelete)) return
    store.elementId = row.id
    store.groupId = row.id
    store._deleteGroup()
  }

  // Biriktirish faqat bitta oyga: ro'yxatda tanlangan oy ∩ guruh davri, joriy oydan oldin emas.
  const attachRange = (row) => {
    const pad = (n) => String(n).padStart(2, '0')
    const now = new Date()
    const y = store.groupParams.year || now.getFullYear()
    const m = store.groupParams.month || now.getMonth() + 1
    const monthFrom = `${y}-${pad(m)}-01`
    const monthTo = `${y}-${pad(m)}-${pad(new Date(y, m, 0).getDate())}`
    const thisMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`
    const canPast = accStore.checkPermission(accStore.pn.turnstileSheetsGroupsPastWrite)
    const from = [monthFrom, String(row.start_date).slice(0, 10), canPast ? monthFrom : thisMonth].sort().pop()
    const to = [monthTo, String(row.end_date).slice(0, 10)].sort()[0]
    return from <= to ? { from, to } : null
  }

  const onAttachWorker = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    const range = attachRange(row)
    if (!range) {
      $Alert.warning(t('shiftType.groupView.pastMonth'))
      return
    }
    store.groupId = row.id
    store.elementId = row.schedule_type?.id
    store.notScheduleParams.start_date = range.from
    store.notScheduleParams.end_date = range.to
    store.notScheduleParams.page = 1
    store._notScheduleWorker()
    store.selectedWorkers = []
    store.notScheduleVisible = true
  }

  const columns = computed(() => [
    {
      key: 'name',
      title: t('content.name'),
      minWidth: 260
    },
    {
      key: 'organization',
      title: t('content.organization'),
      minWidth: 200
    },
    {
      key: 'workers_count',
      title: t('content.worker'),
      width: 90
    },
    {
      key: 'month',
      title: t('content.month'),
      width: 190
    }
  ])

  // Smena kartasidagi kabi «N kishilik» — smena turi chap ro'yxatdan olinadi.
  const crewOf = (row) => crewSizeOf(store.list.find((v) => v.id === row.schedule_type?.id))
  const MONTH_KEYS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  // To'liq oy (1 → oxirgi kun) bo'lsa oy nomi, aks holda davr sanalari.
  const groupMonth = (row) => {
    const start = String(row.start_date || '').slice(0, 10)
    const end = String(row.end_date || '').slice(0, 10)
    const [y, m] = start.split('-').map(Number)
    if (!y || !m) return '—'
    const lastDay = new Date(y, m, 0).getDate()
    const fullMonth = start.endsWith('-01') && end === `${start.slice(0, 8)}${lastDay}`
    return fullMonth
      ? t(`month.${MONTH_KEYS[m - 1]}`)
      : `${Utils.timeOnlyDate(row.start_date)} – ${Utils.timeOnlyDate(row.end_date)}`
  }

  const actions = computed(() => [
    {
      label: t('content.attachment'),
      key: Utils.ActionTypes.attachment,
      icon: UIHelper.renderIcon(OpenFolder24Filled),
      action: onAttachWorker,
      visible: (row) => row?.schedule_type?.type?.id === 2
    },
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onViewWorkers
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    },
    {
      label: t('content.finish'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(CheckmarkCircle32Regular),
      action: onEdit,
      visible: () => accStore.checkPermission(accStore.pn.turnstileSheetsGroupsFinish)
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="turnstile-sheets-groups"
    :columns="columns"
    :actions="actions"
    :data="store.groupList"
    :loading="store.groupLoading"
    :page="store.groupParams.page"
    :per-page="store.groupParams.per_page"
    :total="store.totalGroup"
    storage-key="turnstile-schedule-group"
    @change-page="changePage"
  >
    <template #cell-name="{ row }">
      <div @click="onViewWorkers(row)" class="cursor-pointer">
        <div class="hover:text-primary leading-[1.25] font-medium line-clamp-2">
          {{ row.schedule_type?.name || row.name }}
        </div>
        <div class="mt-1 flex items-center gap-1.5 text-[11px] leading-none text-secondary">
          <span v-if="row.schedule_type?.type?.name" class="px-1.5 py-0.5 rounded bg-surface-ground">
            {{ row.schedule_type.type.name }}
          </span>
          <span
            v-if="crewOf(row)"
            class="px-1.5 py-0.5 rounded bg-surface-ground"
            :title="t('shiftType.groupView.crewSizeHint')"
          >
            {{ t('shiftType.groupView.crewSize', { n: crewOf(row) }) }}
          </span>
        </div>
      </div>
    </template>

    <template #cell-organization="{ row }">
      <span class="line-clamp-2 leading-[1.3]">{{ row.organization?.name || '—' }}</span>
    </template>
    <template #cell-workers_count="{ row }">
      <UIBadge :show-icon="false" :type="Utils.colorTypes.secondary" :label="String(row.workers_count)" />
    </template>

    <template #cell-month="{ row }">
      <span class="whitespace-nowrap">{{ groupMonth(row) }}</span>
    </template>
  </UITable>
</template>
