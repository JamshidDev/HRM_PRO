<script setup>
  import dayjs from 'dayjs'
  import {
    ArrowCircleLeft28Regular,
    ArrowCircleDownRight20Regular,
    ArrowCircleUpLeft20Regular,
    ChevronLeft12Regular,
    ChevronRight12Regular
  } from '@vicons/fluent'
  import { useComponentStore, useAccountStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import TurnstileIcon from '@/assets/icons/turniket.svg'
  import Utils from '@/utils/Utils.js'

  const store = useComponentStore()
  const accStore = useAccountStore()

  const activeTab = ref(1)
  const calendarLoading = ref(false)
  const calendarList = ref([])
  const currentMonth = ref(dayjs())
  const calendarParams = ref({ year: null, month: null })

  const eventInDayLoading = ref(false)
  const eventInDayList = ref([])

  const workerId = ref(null)

  const resolveWorkerId = () => {
    const worker = store.workerPreview?.worker
    if (!worker) return
    if (worker.id) {
      workerId.value = worker.id
      return
    }
    // Zaxira yo'l: preview'da `id` bo'lmasa, JSHSHIR orqali topamiz. Lekin
    // `/hr/check-worker` — org-scope'siz GLOBAL qidiruv va alohida ruxsat talab
    // qiladi; ruxsatsiz rol (masalan Economist) uchun bu 403 + xato toast'i
    // berardi, holbuki kerak bo'lgani atigi ochilgan xodimning `id` si.
    // Ruxsat bo'lmasa — jimgina o'tkazib yuboramiz, turniket bloki bo'sh qoladi.
    if (worker.pin && accStore.checkPermission(accStore.pn.hrCheckWorker)) {
      $ApiService.workerService._checkWorker({ params: { pin: worker.pin } }).then((res) => {
        if (!res.data.error) workerId.value = res.data.data.id
      })
    }
  }

  const calendarItemData = computed(() => {
    const data = {}
    calendarList.value.forEach((item) => {
      if (item.event_date) {
        data[item.event_date] = {
          minute: Math.ceil(item.daily_minutes || 0),
          date: item.event_date
        }
      }
    })
    return data
  })

  const getItemByDate = (year, month, day) => {
    const date = `${year}-${month.toString().length > 1 ? month : '0' + month}-${day.toString().length > 1 ? day : '0' + day}`
    return calendarItemData.value[date] || { minute: 0, date }
  }

  // Fixed Mon-Sun short labels matching the design — this widget has no
  // locale-driven weekday-short i18n keys anywhere in the codebase.
  const WEEKDAY_LABELS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Yak']

  const calendarWeeks = computed(() => {
    const monthStart = currentMonth.value.startOf('month')
    const leadingDays = (monthStart.day() + 6) % 7
    const totalCells = Math.ceil((leadingDays + monthStart.daysInMonth()) / 7) * 7
    const gridStart = monthStart.subtract(leadingDays, 'day')
    const today = dayjs()

    const days = Array.from({ length: totalCells }, (_, i) => {
      const date = gridStart.add(i, 'day')
      const inMonth = date.month() === monthStart.month()
      return {
        date,
        inMonth,
        isToday: inMonth && date.isSame(today, 'day'),
        item: inMonth ? getItemByDate(date.year(), date.month() + 1, date.date()) : null
      }
    })

    const weeks = []
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
    return weeks
  })

  const _calendar = () => {
    if (!workerId.value) return
    calendarLoading.value = true
    $ApiService.turnstileWorkDurationService
      ._HKShow({ params: { ...calendarParams.value }, id: workerId.value })
      .then((res) => {
        calendarList.value = res.data.data
      })
      .finally(() => {
        calendarLoading.value = false
      })
  }

  const _showEventsInDay = (date) => {
    if (!workerId.value) return
    eventInDayLoading.value = true
    $ApiService.turnstileWorkDurationService
      ._HKShowEventsInDay({ params: { date }, id: workerId.value })
      .then((res) => {
        eventInDayList.value = res.data.data
        activeTab.value = 2
      })
      .finally(() => {
        eventInDayLoading.value = false
      })
  }

  const goToMonth = (offset) => {
    currentMonth.value = currentMonth.value.add(offset, 'month')
    calendarParams.value.year = currentMonth.value.year()
    calendarParams.value.month = currentMonth.value.month() + 1
    _calendar()
  }

  const onViewDetail = (v) => {
    if (!v?.minute) return
    _showEventsInDay(v.date)
  }

  const scrollContainerRef = ref(null)
  const rowRefs = ref([])
  let rowObserver = null

  const setRowRef = (el, idx) => {
    if (el) rowRefs.value[idx] = el
  }

  const observeRows = () => {
    rowObserver?.disconnect()
    if (!scrollContainerRef.value) return
    rowObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            rowObserver.unobserve(entry.target)
          }
        })
      },
      { root: scrollContainerRef.value, threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    )
    rowRefs.value.forEach((el) => el && rowObserver.observe(el))
  }

  watch(eventInDayList, () => {
    rowRefs.value = []
    nextTick(observeRows)
  })

  onBeforeUnmount(() => rowObserver?.disconnect())

  watch(() => store.workerPreview, resolveWorkerId, { immediate: true })

  watch(workerId, (id) => {
    if (!id) return
    currentMonth.value = dayjs()
    calendarParams.value.year = currentMonth.value.year()
    calendarParams.value.month = currentMonth.value.month() + 1
    activeTab.value = 1
    _calendar()
  })
</script>

<template>
  <div class="flex flex-col gap-4">
    <SectionHeader :title="$t('workerView.tabs.turnstile')" :icon="TurnstileIcon">
      <n-tabs animated v-model:value="activeTab" class="hidden-tab-header" type="segment">
        <n-tab-pane :name="1">
          <n-spin :show="calendarLoading">
            <div class="turnstile-calendar__nav">
              <button type="button" class="turnstile-calendar__nav-btn" @click="goToMonth(-1)">
                <n-icon :component="ChevronLeft12Regular" />
              </button>
              <div class="turnstile-calendar__title">
                {{ Utils.getMonthNameById(currentMonth.month() + 1) }} {{ currentMonth.year() }}
              </div>
              <button type="button" class="turnstile-calendar__nav-btn" @click="goToMonth(1)">
                <n-icon :component="ChevronRight12Regular" />
              </button>
            </div>

            <div class="turnstile-calendar">
              <div class="turnstile-calendar__weekdays">
                <span v-for="label in WEEKDAY_LABELS" :key="label">{{ label }}</span>
              </div>

              <div class="turnstile-calendar__grid">
                <div
                  v-for="(week, wIdx) in calendarWeeks"
                  :key="wIdx"
                  class="turnstile-calendar__row"
                >
                  <div
                    v-for="day in week"
                    :key="day.date.valueOf()"
                    class="turnstile-calendar__cell"
                    :class="{
                      'turnstile-calendar__cell--empty': !day.inMonth,
                      'turnstile-calendar__cell--today': day.isToday,
                      'turnstile-calendar__cell--clickable': day.inMonth && day.item?.minute
                    }"
                    @click="day.inMonth && onViewDetail(day.item)"
                  >
                    <template v-if="day.inMonth">
                      <span class="turnstile-calendar__date">{{ day.date.date() }}</span>
                      <n-button
                        v-if="day.item?.minute"
                        type="primary"
                        size="tiny"
                        class="turnstile-calendar__badge"
                      >
                        {{ Math.ceil(day.item.minute / 60) }}
                      </n-button>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </n-spin>
        </n-tab-pane>

        <n-tab-pane :name="2">
          <div class="flex flex-col">
            <n-button text @click="activeTab = 1" class="mb-4 shrink-0 self-start">
              {{ $t('content.back') }}
              <template #icon>
                <ArrowCircleLeft28Regular />
              </template>
            </n-button>

            <n-spin :show="eventInDayLoading" style="min-height: 200px">
              <div ref="scrollContainerRef" class="max-h-[420px] overflow-y-auto pr-1">
                <template v-if="eventInDayList.length">
                  <div
                    v-for="(item, idx) in eventInDayList"
                    :key="idx"
                    :ref="(el) => setRowRef(el, idx)"
                    :style="{ '--i': idx % 6 }"
                    class="flex items-stretch timeline-row"
                  >
                    <div class="flex-1 flex justify-end pb-4">
                      <div
                        v-if="!item.direction"
                        class="max-w-[220px] rounded-2xl bg-surface-section px-3.5 py-3 text-right"
                      >
                        <p class="text-sm font-semibold text-danger">
                          {{ $t('hcWorkDuration.form.exit') }}
                        </p>
                        <p class="text-xs text-secondary mt-0.5">{{ item.event_date_and_time }}</p>
                        <span
                          class="inline-block mt-1.5 text-primary bg-primary/10 rounded-lg px-2 py-1 text-xs font-semibold whitespace-nowrap"
                        >
                          {{ item.device }}
                        </span>
                      </div>
                    </div>

                    <div class="flex flex-col items-center shrink-0 px-2">
                      <span
                        class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        :class="
                          item.direction ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                        "
                      >
                        <n-icon size="18">
                          <ArrowCircleDownRight20Regular v-if="item.direction" />
                          <ArrowCircleUpLeft20Regular v-else />
                        </n-icon>
                      </span>
                      <div
                        v-if="idx !== eventInDayList.length - 1"
                        class="w-[2px] flex-1 bg-surface-line my-1"
                      ></div>
                    </div>

                    <div class="flex-1 flex justify-start pb-4">
                      <div
                        v-if="item.direction"
                        class="max-w-[220px] rounded-2xl bg-surface-section px-3.5 py-3"
                      >
                        <p class="text-sm font-semibold text-success">
                          {{ $t('hcWorkDuration.form.enter') }}
                        </p>
                        <p class="text-xs text-secondary mt-0.5">{{ item.event_date_and_time }}</p>
                        <span
                          class="inline-block mt-1.5 text-primary bg-primary/10 rounded-lg px-2 py-1 text-xs font-semibold whitespace-nowrap"
                        >
                          {{ item.device }}
                        </span>
                      </div>
                    </div>
                  </div>
                </template>
                <span v-else class="w-full text-center text-sm inline-block text-textColor3 py-6">
                  {{ $t('content.no-data') }}
                </span>
              </div>
            </n-spin>
          </div>
        </n-tab-pane>
      </n-tabs>
    </SectionHeader>
  </div>
</template>

<style lang="scss" scoped>
  .timeline-row {
    opacity: 0;
    transform: translateY(18px);
    transition:
      opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: calc(var(--i, 0) * 60ms);

    &.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .turnstile-calendar {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border-radius: 18px;
    background-color: #f9fafb;

    &__nav {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 10px;
    }

    &__nav-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: 50%;
      background-color: #d1e9ff;
      color: #2e90fa;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: color-mix(in srgb, #d1e9ff 80%, #2e90fa 20%);
      }
    }

    &__title {
      color: #2e90fa;
      font-size: 17px;
      font-weight: 700;
      white-space: nowrap;
    }

    &__weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      padding-bottom: 4px;
      border-bottom: 2px solid var(--surface-line);
      text-align: center;
      font-size: 13px;
      font-weight: 600;
      color: var(--textColor0);
    }

    &__grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    &__row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 10px;
    }

    &__cell {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 2px;
      min-height: 48px;
      border-radius: 10px;
      border: 1px solid transparent;
      background-color: #ffffff;
      cursor: default;

      &:nth-child(6),
      &:nth-child(7) {
        background-color: #f2f4f7;

        .turnstile-calendar__date {
          color: var(--textColor3);
          font-weight: 500;
        }
      }

      &--empty {
        border-color: transparent !important;
        background-color: transparent !important;
      }

      &--clickable {
        cursor: pointer;
      }

      &--today {
        border-color: #2e90fa !important;
        background-color: #2e90fa !important;

        .turnstile-calendar__date {
          color: #ffffff !important;
        }
      }
    }

    &__date {
      font-size: 14px;
      font-weight: 700;
      color: var(--textColor0);
    }

    // .n-button's own root is where naive-ui paints background/color/size
    // (via `background-color: var(--n-color)` etc. in its own stylesheet) —
    // since it's rendered directly by this SFC, plain scoped selectors reach
    // it (no :deep() needed), but real properties still need !important to
    // beat naive's same-specificity rule.
    &__badge {
      height: auto !important;
      width: auto !important;
      min-width: auto !important;
      padding: 2px 12px !important;
      border-radius: 999px !important;
      background-color: #e4f9e8 !important;
      color: #008838 !important;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;

      &:hover,
      &:focus {
        background-color: #e4f9e8 !important;
        color: #008838 !important;
      }
    }
  }

  // Naive draws the button's actual visible edge via an overlay div on top
  // of the button, not via the root's own `border` property — it's rendered
  // by naive's internal template, not this SFC's, so it needs :deep().
  :deep(.turnstile-calendar__badge .n-button__border),
  :deep(.turnstile-calendar__badge .n-button__state-border) {
    border: none !important;
  }

  [data-theme='dark'] {
    .turnstile-calendar {
      background-color: var(--surface-section);
    }

    .turnstile-calendar__cell {
      border-color: var(--surface-line);
      background-color: var(--surface-section);

      &:nth-child(6),
      &:nth-child(7) {
        background-color: var(--table-header);
      }

      &.turnstile-calendar__cell--empty {
        border-color: transparent;
        background-color: transparent;
      }
    }
  }

  // The base sizing above is already compact enough for most phone widths.
  // Below ~400px (e.g. iPhone SE) the badge pill is the one piece still at
  // risk of overflowing a narrow cell, so trim just that.
  @media (max-width: 400px) {
    .turnstile-calendar__badge {
      padding: 2px 8px !important;
      font-size: 11px;
    }
  }
</style>
