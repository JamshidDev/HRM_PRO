<script setup>
  import dayjs from 'dayjs'
  import { useAccountStore, useShiftTypeStore } from '@/store/modules/index.js'
  import { UIUser } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import {
    crewSizeOf,
    cycleDays,
    cycleIndex,
    isRotating,
    slotPhase
  } from '@/pages/turnstile/scheduleWorker/ui/navbat.js'
  import AssignWorkerModal from './AssignWorkerModal.vue'
  import { toWorkerItem } from './workerItem.js'
  import { Add16Regular, CalendarLtr20Regular, Dismiss16Regular, Dismiss24Regular } from '@vicons/fluent'
  import { useDialog } from 'naive-ui'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const DAILY_TYPE = 2

  // Oy bo'yicha o'rinlar: tizim har o'rinning kunlarini quradi, HR o'rinlarga xodim biriktiradi.
  const store = useShiftTypeStore()
  const accStore = useAccountStore()
  const dialog = useDialog()

  const shiftType = computed(() => store.list.find((v) => v.id === store.elementId) ?? null)
  const daily = computed(() => shiftType.value?.type?.id === DAILY_TYPE)
  const pattern = computed(() => cycleDays(shiftType.value))
  const crewSize = computed(() => (isRotating(shiftType.value) ? crewSizeOf(shiftType.value) : 1))

  const startDate = computed(() => store.generatePayload.start_date)
  const endDate = computed(() => store.generatePayload.end_date)

  const holidays = ref(new Set())
  const days = computed(() => {
    if (!endDate.value) return []
    const end = dayjs(endDate.value)
    const out = []
    for (let d = end.startOf('month'); !d.isAfter(end, 'day'); d = d.add(1, 'day')) {
      const date = d.format('YYYY-MM-DD')
      out.push({
        date,
        day: d.date(),
        weekDay: d.day(),
        off: d.day() === 0 || holidays.value.has(date),
        out: date < startDate.value || date > endDate.value
      })
    }
    return out
  })

  // Har kunlik: yakshanba va bayram dam (naqshda `holiday` bo'lmasa) — backend qoidasi bilan bir xil.
  const dailyCell = (d) => {
    const p = shiftType.value?.days?.find((x) => Number(x.day) === (d.weekDay === 0 ? 7 : d.weekDay))
    const off = d.off && !(p && 'holiday' in p)
    return off || !p ? { work_status: false } : p
  }

  // Tungi smenaning yarim tundan keyingi davomi — alohida chiqish emas.
  const continuation = computed(() =>
    pattern.value.map((p, k, arr) => {
      const prev = arr[(k - 1 + arr.length) % arr.length]
      return !!(p.work_status && prev?.work_status && p.start_time?.startsWith('00:00') && prev.end_time?.startsWith('00:00'))
    })
  )

  const slots = ref([])
  const rows = computed(() =>
    slots.value.map((s, i) => {
      const n = pattern.value.length
      const phase = daily.value ? 0 : slotPhase(i, crewSize.value, n)
      const cells = days.value.map((d) => {
        const k = daily.value ? -1 : cycleIndex(d.date, phase, n)
        const p = daily.value ? dailyCell(d) : pattern.value[k]
        return {
          ...d,
          work: !!p?.work_status,
          cont: k >= 0 && continuation.value[k],
          start: p?.start_time?.slice(0, 5),
          end: p?.end_time?.slice(0, 5),
          minutes: p?.daily_minutes ?? 0
        }
      })
      const hours = Math.round(cells.filter((c) => c.work && !c.out).reduce((a, c) => a + c.minutes, 0) / 60)
      const crew = daily.value ? null : Math.floor(i / crewSize.value)
      return {
        slot: s,
        index: i,
        phase,
        cells,
        hours,
        crew,
        crewStart: !daily.value && i % crewSize.value === 0,
        crewEnd: !daily.value && ((i + 1) % crewSize.value === 0 || i === slots.value.length - 1)
      }
    })
  )

  // Kunlik qoplama: shu kuni ishlaydigan, xodim biriktirilgan o'rinlar / jami ishlaydigan o'rinlar.
  const coverage = computed(() =>
    days.value.map((d, di) => {
      let total = 0
      let filled = 0
      for (const r of rows.value) {
        if (d.out || !r.cells[di].work || r.cells[di].cont) continue
        total++
        if (r.slot.wp) filled++
      }
      return { out: d.out, total, filled }
    })
  )

  const loadHolidays = () => {
    const m = dayjs(endDate.value)
    $ApiService.workerScheduleService
      ._daysOfMonth({ params: { year: m.year(), month: m.month() + 1 } })
      .then((res) => {
        const mm = m.format('YYYY-MM')
        holidays.value = new Set(
          (res.data.data.days ?? [])
            .filter((d) => d.is_holiday)
            .map((d) => `${mm}-${String(d.day).padStart(2, '0')}`)
        )
      })
  }

  watch(
    () => store.rotatingVisible,
    (v) => {
      if (!v) return
      // Aylanma smenada o'rinlar to'liq brigadagacha yaxlitlanadi — ortiqchasi bo'sh o'rin bo'lib qoladi.
      const n = Math.max(1, Number(store.generatePayload.workers_count) || 1)
      const total = daily.value ? n : Math.ceil(n / crewSize.value) * crewSize.value
      slots.value = Array.from({ length: total }, (_, i) => ({ wp: null, worker: null, extra: i >= n }))
      holidays.value = new Set()
      loadHolidays()
      busyIds.value = new Set()
      if (mode.value !== 'count') fillWorkers(n)
    }
  )

  // «Smenasizlar» / «Barchasi»: xodimlar o'rinlarga ketma-ket joylanadi, HR keyin almashtira oladi.
  const mode = computed(() => store.generatePayload.count_mode)
  const busyIds = ref(new Set())
  const filling = ref(false)
  const fillWorkers = (n) => {
    const range = { start_date: startDate.value, end_date: endDate.value }
    filling.value = true
    const list = $ApiService.shiftTypeService._getWorkers({
      params: { page: 1, per_page: n, ...(mode.value === 'free' ? { has_schedule: 'No', ...range } : {}) }
    })
    // «Barchasi»da shu davrda boshqa smenasi borlar belgilanadi — saqlanganda ular shu smenaga ko'chadi.
    const busy =
      mode.value === 'all'
        ? $ApiService.shiftTypeService._getWorkers({ params: { page: 1, per_page: 10000, has_schedule: 'Yes', ...range } })
        : Promise.resolve(null)
    Promise.all([list, busy])
      .then(([res, busyRes]) => {
        busyIds.value = new Set((busyRes?.data.data.data ?? []).map((v) => v.id))
        res.data.data.data.map(toWorkerItem).forEach((w, i) => {
          if (!slots.value[i]) return
          slots.value[i].wp = w.id
          slots.value[i].worker = w
        })
      })
      .finally(() => {
        filling.value = false
      })
  }
  const movedCount = computed(() => slots.value.filter((s) => s.wp && busyIds.value.has(s.wp)).length)

  // Biriktirish oynasi: qaysi qatorga xodim qo'yilayotgani.
  const assign = reactive({ visible: false, row: null })
  const takenIds = computed(() => slots.value.map((s) => s.wp).filter(Boolean))
  const openAssign = (row) => {
    assign.row = row
    assign.visible = true
  }
  const onAssign = (worker) => {
    const s = slots.value[assign.row.index]
    s.wp = worker.id
    s.worker = worker
  }
  const unassign = (row) => {
    const s = slots.value[row.index]
    s.wp = null
    s.worker = null
  }
  const assignHint = computed(() =>
    assign.row && !daily.value
      ? t('shiftType.generate.assignHint', { crew: assign.row.crew + 1, slot: (assign.row.index % crewSize.value) + 1 })
      : ''
  )

  const filledCount = computed(() => takenIds.value.length)
  const crewCount = computed(() => (daily.value ? 0 : Math.ceil(slots.value.length / crewSize.value)))

  const onSave = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsWorkersWrite)) return
    if (!filledCount.value) {
      $Toast.warning(t('shiftType.generate.noWorkerSelected'))
      return
    }
    if (!movedCount.value) return save()
    dialog.warning({
      title: t('shiftType.generate.moveTitle'),
      content: t('shiftType.generate.moveConfirm', { n: movedCount.value }),
      positiveText: t('content.yes'),
      negativeText: t('content.no'),
      onPositiveClick: save
    })
  }

  const save = () => {
    const base = {
      schedule_type: store.elementId,
      start_date: startDate.value,
      end_date: endDate.value
    }
    const filled = rows.value.filter((r) => r.slot.wp)
    if (daily.value) {
      store._generateWorkerSchedule({ ...base, worker_position_ids: filled.map((r) => r.slot.wp) })
      return
    }
    // Backend birinchi kunda (day + 1) % n naqsh kunini oladi.
    const n = pattern.value.length
    store._generateWorkerSchedule({
      ...base,
      schedule_workers: filled.map((r) => ({
        worker_position_id: r.slot.wp,
        day: (cycleIndex(startDate.value, r.phase, n) - 1 + n) % n
      }))
    })
  }

  // Jadvalning to'liq kengligi: №, xodim, kunlar, soat ustunlari.
  const tableWidth = computed(() => `${48 + 300 + 52 * days.value.length + 70}px`)

  const monthTitle = computed(() => {
    if (!endDate.value) return ''
    const m = dayjs(endDate.value)
    return `${Utils.monthList.find((x) => x.id === m.month() + 1)?.name ?? ''} ${m.year()}`
  })
</script>

<template>
  <n-drawer v-model:show="store.rotatingVisible" height="100%" placement="bottom" :mask-closable="false">
    <div class="h-full flex flex-col bg-surface-ground">
      <header class="shrink-0 flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 bg-surface-section border-b border-surface-line">
        <span class="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <n-icon size="22"><CalendarLtr20Regular /></n-icon>
        </span>
        <div class="min-w-0">
          <div class="font-semibold text-base leading-[1.25] line-clamp-1" :title="shiftType?.name">
            {{ shiftType?.name }}
          </div>
          <div class="mt-0.5 flex items-center gap-2 text-xs">
            <span class="px-1.5 py-px rounded bg-primary/10 text-primary font-medium">{{ shiftType?.type?.name }}</span>
            <span class="text-secondary">{{ monthTitle }}</span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span v-if="!daily" class="px-2.5 py-1 rounded-full bg-primary text-white font-medium">
            {{ $t('shiftType.groupView.crewSize', { n: crewSize }) }}
          </span>
          <span v-if="!daily" class="px-2.5 py-1 rounded-full bg-surface-ground font-medium">
            {{ $t('shiftType.generate.crewsN', { n: crewCount }) }}
          </span>
          <span
            class="px-2.5 py-1 rounded-full font-medium"
            :class="filledCount === slots.length ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'"
          >
            {{ $t('shiftType.generate.filled', { filled: filledCount, total: slots.length }) }}
          </span>
        </div>

        <div class="ml-auto flex items-center gap-3">
          <n-button secondary type="error" @click="store.rotatingVisible = false">{{ $t('content.cancel') }}</n-button>
          <n-button type="primary" :loading="store.saveLoading" :disabled="!filledCount" @click="onSave">
            {{ $t('content.save') }}
          </n-button>
          <n-button quaternary circle @click="store.rotatingVisible = false">
            <template #icon><n-icon><Dismiss24Regular /></n-icon></template>
          </n-button>
        </div>
      </header>

      <div class="flex-1 min-h-0 p-4">
        <n-spin :show="filling" class="h-full" content-class="h-full">
          <div class="h-full overflow-auto relative bg-surface-section border border-surface-line rounded-xl">
            <div class="flex w-fit min-w-full sticky top-0 z-[10] bg-surface-section">
              <div class="cell-h w-[48px] min-w-[48px] sticky left-0 z-[20]">№</div>
              <div class="cell-h w-[300px] min-w-[300px] sticky left-[48px] z-[20] justify-start! px-3">
                {{ $t('content.worker') }}
              </div>
              <div
                v-for="d in days"
                :key="d.date"
                class="cell-h w-[52px] min-w-[52px] flex-col"
                :class="{ 'text-error': d.off, 'opacity-40': d.out }"
              >
                <span class="font-bold">{{ d.day }}</span>
                <span class="text-[10px]">{{ store.shortNameOfWeek[d.weekDay] }}</span>
              </div>
              <div class="cell-h w-[70px] min-w-[70px] sticky right-0 z-[20]">{{ $t('schedule.form.workTime') }}</div>
            </div>

            <template v-for="r in rows" :key="r.index">
              <div
                v-if="r.crewStart"
                class="flex min-w-full bg-surface-ground text-xs font-semibold text-secondary h-[28px] items-center"
                :style="{ width: tableWidth }"
              >
                <span class="sticky left-0 px-3">{{ $t('shiftType.generate.crewN', { n: r.crew + 1 }) }}</span>
              </div>
              <div class="flex w-fit min-w-full" :class="{ 'crew-end': r.crewEnd }">
                <div class="cell w-[48px] min-w-[48px] sticky left-0 z-[5] bg-surface-section text-secondary">
                  {{ r.index + 1 }}
                </div>
                <div class="cell w-[300px] min-w-[300px] sticky left-[48px] z-[5] bg-surface-section px-2 justify-start!">
                  <div v-if="r.slot.worker" class="group w-full flex items-center gap-1 min-w-0">
                    <button
                      type="button"
                      class="flex-1 min-w-0 text-left rounded-md px-1 py-0.5 hover:bg-primary/5"
                      :title="$t('shiftType.generate.change')"
                      @click="openAssign(r)"
                    >
                      <UIUser :data="r.slot.worker.data" :short="false" :avatar-clickable="false" hide-tooltip />
                      <span
                        v-if="busyIds.has(r.slot.wp)"
                        class="ml-[42px] -mt-0.5 block text-[10px] leading-none text-warning font-medium"
                      >
                        {{ $t('shiftType.generate.inOtherShift') }}
                      </span>
                    </button>
                    <n-button
                      quaternary
                      circle
                      size="tiny"
                      class="opacity-0 group-hover:opacity-100"
                      :title="$t('shiftType.generate.unassign')"
                      @click="unassign(r)"
                    >
                      <template #icon><n-icon><Dismiss16Regular /></n-icon></template>
                    </n-button>
                  </div>
                  <button
                    v-else
                    type="button"
                    class="w-full h-[36px] flex items-center justify-center gap-1.5 rounded-lg border border-dashed text-sm transition-colors"
                    :class="
                      r.slot.extra
                        ? 'border-surface-line text-secondary hover:border-primary/50 hover:text-primary'
                        : 'border-primary/40 text-primary hover:bg-primary/5'
                    "
                    @click="openAssign(r)"
                  >
                    <n-icon size="16"><Add16Regular /></n-icon>
                    <span>{{ $t('shiftType.generate.assign') }}</span>
                    <span v-if="r.slot.extra" class="text-xs opacity-70">· {{ $t('shiftType.generate.emptySlot') }}</span>
                  </button>
                </div>
                <div
                  v-for="c in r.cells"
                  :key="c.date"
                  class="cell w-[52px] min-w-[52px] flex-col text-[10px] leading-[1.15]"
                  :class="
                    c.out
                      ? 'out'
                      : c.work
                        ? r.slot.wp
                          ? 'bg-primary/15 text-primary'
                          : r.slot.extra
                            ? 'empty-work text-secondary'
                            : 'bg-primary/5 text-primary/70'
                        : 'text-secondary/60'
                  "
                >
                  <template v-if="c.out" />
                  <template v-else-if="c.work">
                    <span class="font-medium">{{ c.start }}</span>
                    <span>{{ c.end }}</span>
                  </template>
                  <span v-else>{{ $t('shiftType.groupView.rest') }}</span>
                </div>
                <div class="cell w-[70px] min-w-[70px] sticky right-0 z-[5] bg-surface-section font-medium">
                  {{ r.hours }}
                </div>
              </div>
            </template>

            <div class="flex w-fit min-w-full sticky bottom-0 z-[10] bg-surface-section border-t-2 border-surface-line">
              <div class="cell w-[348px] min-w-[348px] sticky left-0 z-[20] bg-surface-section justify-start! px-3 text-xs font-semibold text-secondary">
                {{ $t('shiftType.generate.coverage') }}
              </div>
              <div
                v-for="(c, i) in coverage"
                :key="i"
                class="cell w-[52px] min-w-[52px] text-xs font-semibold"
                :class="c.out ? 'out' : c.filled < c.total ? 'text-warning' : 'text-success'"
              >
                <template v-if="!c.out">{{ c.filled }}/{{ c.total }}</template>
              </div>
              <div class="cell w-[70px] min-w-[70px] sticky right-0 z-[20] bg-surface-section"></div>
            </div>
          </div>
        </n-spin>
      </div>
    </div>

    <AssignWorkerModal
      v-model:visible="assign.visible"
      :title="$t('shiftType.generate.assignTitle', { n: (assign.row?.index ?? 0) + 1 })"
      :hint="assignHint"
      :start-date="startDate"
      :end-date="endDate"
      :taken-ids="takenIds"
      :only-free="mode !== 'all'"
      @select="onAssign"
    />
  </n-drawer>
</template>

<style scoped>
  .cell-h,
  .cell {
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid var(--color-surface-line);
    border-bottom: 1px solid var(--color-surface-line);
    flex-shrink: 0;
  }
  .cell-h {
    height: 46px;
    font-size: 12px;
    color: var(--color-secondary);
    background: var(--color-surface-section);
  }
  .cell {
    height: 52px;
  }
  .empty-work {
    outline: 1px dashed color-mix(in srgb, var(--color-secondary) 45%, transparent);
    outline-offset: -4px;
  }
  .out {
    background: repeating-linear-gradient(
      -45deg,
      transparent 0 4px,
      color-mix(in srgb, var(--color-secondary) 12%, transparent) 4px 6px
    );
  }
  .crew-end > div {
    box-shadow: inset 0 -2px 0 color-mix(in srgb, var(--color-primary) 45%, transparent);
  }
</style>
