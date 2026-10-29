<script setup>
  // Tizim ish soati: oy kunlari kalendari + kun tafsiloti (tabeldagi kun oynasi tab ichida).
  import { computed, ref, watch } from 'vue'
  import dayjs from 'dayjs'
  import { ChevronLeft16Regular, Info16Regular, PersonClock20Regular } from '@vicons/fluent'
  import { UIModal } from '@/components/index.js'
  import DayDetailModal from '@/pages/hrm/timesheet/ui/DayDetailModal.vue'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const props = defineProps({
    // Qaydnoma qatori id (statements.id)
    statementId: { type: Number, default: null }
  })
  const visible = defineModel('visible', { type: Boolean, default: false })

  const data = ref(null)
  const loading = ref(false)
  const tab = ref('month')
  const selectedDate = ref('')

  // Ta'til / buyruq asosidagi tabel turlari (backend VACATION_COMMAND_TO_TYPE).
  const VACATION_TYPES = new Set([14, 15, 16, 19, 20, 21, 22])

  const load = async () => {
    if (!visible.value || !props.statementId) return
    loading.value = true
    data.value = null
    tab.value = 'month'
    selectedDate.value = ''
    try {
      const res = await $ApiService.monthReportService._systemHours({ id: props.statementId })
      data.value = res.data.data
    } finally {
      loading.value = false
    }
  }
  watch(() => [visible.value, props.statementId], load, { immediate: true })

  const loadDay = async (_id, date) => {
    const res = await $ApiService.monthReportService._systemHoursDay({
      id: props.statementId,
      params: { date }
    })
    return res.data.data
  }


  const monthLabel = computed(() => {
    if (!data.value) return ''
    const m = Utils.monthList.find((x) => x.id === Number(data.value.month))?.name
    return `${data.value.year}, ${m || data.value.month}`
  })

  const weekKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weekHead = computed(() => weekKeys.map((k) => t(`shortWeek.${k}`)))

  const toneOf = (d) => {
    if (d.status == null) return 'rest'
    if (VACATION_TYPES.has(d.status)) return 'vacation'
    if (d.status === 3) return 'holiday'
    return (d.hours ?? 0) > 0 ? 'work' : 'zero'
  }

  // Dushanbadan boshlanadigan kalendar: oy boshidagi bo'sh kataklar + kunlar.
  const cells = computed(() => {
    if (!data.value) return []
    const first = dayjs(data.value.days[0]?.date)
    const lead = (first.day() + 6) % 7
    const today = dayjs().format('YYYY-MM-DD')
    return [
      ...Array.from({ length: lead }, (_, i) => ({ empty: true, uid: `e${i}` })),
      ...data.value.days.map((d) => ({
        ...d,
        uid: d.date,
        tone: toneOf(d),
        weekend: [0, 6].includes(dayjs(d.date).day()),
        future: d.date > today
      }))
    ]
  })

  const legend = computed(() => [
    { tone: 'work', label: t('monthReport.systemHours.work') },
    { tone: 'zero', label: t('monthReport.systemHours.zero') },
    { tone: 'vacation', label: t('monthReport.systemHours.vacation') },
    { tone: 'holiday', label: t('monthReport.systemHours.holiday') },
    { tone: 'rest', label: t('monthReport.systemHours.rest') }
  ])

  const diff = computed(() => {
    if (!data.value || data.value.statement_hours == null) return null
    return Math.round((data.value.total_hours - data.value.statement_hours) * 100) / 100
  })

  const initials = computed(() =>
    (data.value?.worker?.full_name || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('')
  )

  const openDay = (d) => {
    if (d.empty) return
    selectedDate.value = d.date
    tab.value = 'day'
  }

  const detailWorker = computed(() => ({
    id: props.statementId,
    full_name: data.value?.worker?.full_name,
    photo: data.value?.worker?.photo,
    position: data.value?.worker?.position
  }))
  const navDays = computed(() => (data.value?.days ?? []).map((d) => ({ day: d.day })))
</script>

<template>
  <UIModal
    v-model:visible="visible"
    :width="1320"
    height="88vh"
    fullscreen-on-mobile
    :title="$t('monthReport.systemHours.title')"
  >
    <n-spin :show="loading" class="h-full sh-spin">
      <div class="flex flex-col h-full min-h-[320px]">
        <!-- Kim + yakuniy ko'rsatkichlar -->
        <div v-if="data" class="sh-head shrink-0 flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <n-avatar
              v-if="data.worker.photo"
              :fallback-src="Utils.noAvailableImage"
              :size="30"
              :src="data.worker.photo"
              round
            />
            <span v-else class="sh-ava">{{ initials }}</span>
            <div class="min-w-0">
              <p class="text-[13px] font-semibold text-textColor1 truncate leading-4">{{ data.worker.full_name }}</p>
              <p class="text-[11px] text-fig-text-secondary truncate leading-4">
                {{ data.worker.position || '—' }} · {{ data.organization.name }}
              </p>
              <p class="text-[10px] text-fig-text-tertiary leading-4">{{ monthLabel }} · {{ data.worker.pin }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-1.5">
            <div class="sh-stat">
              <span class="sh-stat-label">
                {{ $t('monthReport.systemHours.total') }}
                <n-popover trigger="hover" placement="top" :style="{ maxWidth: '300px' }">
                  <template #trigger>
                    <n-icon :component="Info16Regular" size="14" class="cursor-help" />
                  </template>
                  {{ $t('monthReport.systemHours.totalTip') }}
                </n-popover>
              </span>
              <span class="sh-stat-num">
                {{ data.total_hours }} <i>{{ $t('monthReport.systemHours.hourShort') }}</i>
              </span>
            </div>
            <div class="sh-stat">
              <span class="sh-stat-label">{{ $t('monthReport.systemHours.statement') }}</span>
              <span class="sh-stat-num">
                {{ data.statement_hours ?? '—' }}
                <i v-if="data.statement_hours != null">{{ $t('monthReport.systemHours.hourShort') }}</i>
              </span>
            </div>
            <div v-if="diff !== null" class="sh-stat">
              <span class="sh-stat-label">{{ $t('monthReport.systemHours.diff') }}</span>
              <span class="sh-stat-num">
                {{ diff > 0 ? '+' : '' }}{{ diff }} <i>{{ $t('monthReport.systemHours.hourShort') }}</i>
              </span>
            </div>
            <div class="sh-stat">
              <span class="sh-stat-label">{{ $t('monthReport.systemHours.workedDays') }}</span>
              <span class="sh-stat-num">
                {{ data.worked_days }} <i>{{ $t('monthReport.systemHours.dayShort') }}</i>
              </span>
            </div>
          </div>
        </div>

        <!-- Lavozim topilmadi -->
        <div
          v-if="data && !data.worker_position_id"
          class="flex-1 flex flex-col items-center justify-center text-center gap-2 px-6"
        >
          <n-icon :component="PersonClock20Regular" size="40" class="text-fig-text-tertiary" />
          <p class="text-sm font-semibold text-textColor1">{{ $t('monthReport.systemHours.noPosition') }}</p>
          <p class="text-xs text-fig-text-secondary max-w-[460px]">
            {{ $t('monthReport.systemHours.noPositionHint') }}
          </p>
        </div>

        <template v-else-if="data">
          <div v-if="tab === 'month'" class="shrink-0 flex justify-end py-3">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span v-for="l in legend" :key="l.tone" class="flex items-center gap-1.5 text-xs text-fig-text-secondary">
                <span class="sh-dot" :class="`is-${l.tone}`" />{{ l.label }}
              </span>
            </div>
          </div>

          <!-- Faqat shu qism skroll bo'ladi -->
          <div class="flex-1 min-h-0 overflow-y-auto sh-scroll">
            <div v-if="tab === 'month'" class="h-full flex flex-col">
              <div class="sh-grid sh-grid-head">
                <span v-for="w in weekHead" :key="w">{{ w }}</span>
              </div>
              <div class="sh-grid sh-grid-days">
                <template v-for="c in cells" :key="c.uid">
                  <span v-if="c.empty" class="sh-cell is-empty" />
                  <button
                    v-else
                    type="button"
                    class="sh-cell"
                    :class="[`is-${c.tone}`, { 'is-weekend': c.weekend, 'is-future': c.future }]"
                    @click="openDay(c)"
                  >
                    <span class="sh-cell-top">
                      <b><span class="sh-dot" :class="`is-${c.tone}`" />{{ c.day }}</b>
                      <em v-if="c.key && c.status != null">{{ c.key }}</em>
                    </span>
                    <span class="sh-cell-hours">
                      <template v-if="c.tone === 'rest'">{{ $t('monthReport.systemHours.rest') }}</template>
                      <template v-else-if="c.tone === 'vacation'">—</template>
                      <template v-else>
                        {{ c.hours ?? 0 }}<i>{{ $t('monthReport.systemHours.hourShort') }}</i>
                      </template>
                    </span>
                  </button>
                </template>
              </div>
            </div>

            <div v-else class="relative">
              <button type="button" class="sh-back" @click="tab = 'month'">
                <n-icon :component="ChevronLeft16Regular" size="14" />
                {{ $t('monthReport.systemHours.tabMonth') }}
              </button>
              <DayDetailModal
                v-if="selectedDate"
                v-model:date="selectedDate"
                :visible="true"
                :worker="detailWorker"
                :days="navDays"
                :loader="loadDay"
                embedded
              />
              <p v-else class="text-sm text-fig-text-secondary text-center py-10">
                {{ $t('monthReport.systemHours.pickDay') }}
              </p>
            </div>
          </div>
        </template>
      </div>
    </n-spin>
  </UIModal>
</template>

<style lang="scss" scoped>
  .sh-spin :deep(.n-spin-content) {
    height: 100%;
  }

  // Xodim ma'lumoti + ko'rsatkichlar — bitta ramka ichida.
  .sh-head {
    padding: 8px 10px 8px 12px;
    margin-bottom: 4px;
    background: var(--fig-bg-tertiary);
    border: 1px solid var(--fig-br-secondary);
    border-radius: 12px;
  }

  .sh-ava {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    font-size: 12px;
    font-weight: 600;
    color: var(--fig-text-secondary);
    background: var(--fig-bg-tertiary);
    border-radius: 50%;
  }

  // Ko'rsatkichlar — bir xil neytral karta, rang faqat raqamda.
  .sh-stat {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-width: 84px;
    padding: 3px 10px;
    background: var(--fig-block-bg);
    border: 1px solid var(--fig-br-secondary);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgb(16 24 40 / 8%);

    &-label {
      display: flex;
      gap: 4px;
      align-items: center;
      font-size: 10px;
      color: var(--fig-text-tertiary);
    }

    &-num {
      font-size: 14px;
      font-weight: 600;
      line-height: 18px;
      font-variant-numeric: tabular-nums;
      color: var(--fig-text-primary);

      i {
        font-size: 11px;
        font-style: normal;
        font-weight: 400;
        color: var(--fig-text-tertiary);
      }
    }

  }

  // Kun ko'rinishidan oy kalendariga qaytish — sana navigatsiyasi qatorida, chapda.
  .sh-back {
    position: absolute;
    top: 8px;
    left: 0;
    z-index: 1;
    display: inline-flex;
    gap: 4px;
    align-items: center;
    height: 30px;
    padding: 0 10px 0 6px;
    font-size: 12px;
    font-weight: 500;
    color: var(--fig-text-secondary);
    cursor: pointer;
    background: var(--fig-block-bg);
    border: 1px solid var(--fig-br-secondary);
    border-radius: 8px;
    transition: color 160ms ease-out, border-color 160ms ease-out;

    &:hover {
      color: var(--fig-text-brand);
      border-color: var(--fig-icon-brand);
    }
  }

  .sh-scroll {
    padding-right: 2px;
  }

  .sh-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 6px;
  }

  // Kalendar modal balandligini to'ldiradi — qatorlar bo'sh joyni teng bo'ladi.
  .sh-grid-days {
    flex: 1;
    grid-auto-rows: minmax(64px, 1fr);
  }

  .sh-grid-head {
    position: sticky;
    top: 0;
    z-index: 1;
    padding-bottom: 4px;
    background: var(--fig-block-bg);

    span {
      font-size: 11px;
      font-weight: 500;
      color: var(--fig-text-tertiary);
      text-align: center;
    }
  }

  // Kun katagi — neytral fon, holat faqat nuqta va soat rangida.
  .sh-cell {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 2px;
    min-height: 64px;
    padding: 8px 10px;
    text-align: left;
    cursor: pointer;
    background: var(--fig-block-bg);
    border: 1px solid var(--fig-br-secondary);
    border-radius: 12px;
    outline: none;
    box-shadow: 0 1px 3px rgb(16 24 40 / 8%);
    transition:
      border-color 160ms ease-out,
      box-shadow 160ms ease-out,
      transform 160ms ease-out;

    &:hover,
    &:focus-visible {
      border-color: var(--fig-icon-brand);
      box-shadow: 0 4px 12px rgb(16 24 40 / 12%);
      transform: translateY(-1px);
    }

    &.is-empty {
      pointer-events: none;
      background: transparent;
      border-color: transparent;
    }

    &-top {
      display: flex;
      align-items: center;
      justify-content: space-between;

      b {
        display: flex;
        gap: 5px;
        align-items: center;
        font-size: 13px;
        font-weight: 500;
        color: var(--fig-text-secondary);
      }

      em {
        font-size: 10px;
        font-style: normal;
        font-weight: 500;
        color: var(--fig-text-tertiary);
      }
    }

    &-hours {
      font-size: 24px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      line-height: 1.2;
      color: var(--fig-text-primary);

      i {
        margin-left: 3px;
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        color: var(--fig-text-tertiary);
      }
    }

    &.is-rest {
      background: var(--fig-bg-tertiary);
      border-style: dashed;
      box-shadow: none;

      .sh-cell-hours {
        font-size: 11px;
        font-weight: 400;
        color: var(--fig-text-tertiary);
      }
    }

    &.is-future {
      opacity: 0.55;
    }
  }

  .sh-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;

    &.is-work {
      background: var(--fig-icon-green);
    }

    &.is-zero {
      background: var(--fig-icon-red);
    }

    &.is-vacation {
      background: var(--fig-icon-amber);
    }

    &.is-holiday {
      background: var(--fig-icon-indigo);
    }

    &.is-rest {
      background: var(--fig-neutral-300);
    }
  }

  @media (max-width: 640px) {
    .sh-grid {
      gap: 4px;
    }

    .sh-grid-days {
      grid-auto-rows: minmax(48px, 1fr);
    }

    .sh-cell {
      min-height: 48px;
      padding: 4px 5px;

      &-hours {
        font-size: 16px;
      }
    }
  }
</style>
