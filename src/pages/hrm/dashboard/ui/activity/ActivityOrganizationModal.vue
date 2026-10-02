<script setup>
  // Korxona kartasi (Figma node 3871:63669): so'nggi 30 kunlik faollik va oxirgi amallar.
  import XmarkIcon from '@/assets/icons/hrmDashboard/activity/xmark.svg?url'
  import CalendarIcon from '@/assets/icons/hrmDashboard/activity/calendar-sm.svg?url'
  import HeadChartLine from '@/assets/icons/hrmDashboard/activity/head-chart-line.svg?url'
  import LegendAvgLine from '@/assets/icons/hrmDashboard/activity/legend-avg-line.svg?url'
  import AvgLine from '@/assets/icons/hrmDashboard/activity/avg-line.svg?url'
  import LogPencil from '@/assets/icons/hrmDashboard/activity/log-pencil.svg?url'
  import LogFilePlus from '@/assets/icons/hrmDashboard/activity/log-file-plus.svg?url'
  import LogCirclePlus from '@/assets/icons/hrmDashboard/activity/log-circle-plus.svg?url'
  import LogTrash from '@/assets/icons/hrmDashboard/activity/log-trash.svg?url'
  import { NIcon } from 'naive-ui'
  import { Building20Regular } from '@vicons/fluent'
  import ApiService from '@/service/ApiService.js'
  import i18n from '@/i18n/index.js'
  import { dayMonth, formatCount, isOffDay, monthName, parseDbDate } from './utils.js'

  const visible = defineModel('visible', { type: Boolean, default: false })

  const props = defineProps({
    // Jadval qatori: { id, name, workers, ... }
    organization: { type: Object, default: null }
  })

  const { t } = i18n.global

  const LOG_TYPES = {
    edit: { icon: LogPencil, bg: 'bg-fig-bg-brand-surface' },
    create: { icon: LogFilePlus, bg: 'bg-[#f6dafc]' },
    add: { icon: LogCirclePlus, bg: 'bg-fig-green-100' },
    delete: { icon: LogTrash, bg: 'bg-fig-red-100' }
  }

  const loading = ref(false)
  const data = ref(null)
  const loadedAt = ref(null)

  const load = (id) => {
    loading.value = true
    data.value = null
    ApiService.dashboardService
      ._activityOrganization({ id })
      .then((res) => {
        if (props.organization?.id !== id) return
        data.value = res.data.data
        loadedAt.value = new Date()
      })
      .finally(() => (loading.value = false))
  }
  watch(
    () => [visible.value, props.organization?.id],
    ([show, id]) => show && id && load(id),
    { immediate: true }
  )

  const daily = computed(() =>
    (data.value?.daily || []).map((d) => {
      const date = new Date(`${d.date}T00:00:00`)
      return { date, value: d.total, off: isOffDay(date) }
    })
  )

  const logs = computed(() =>
    (data.value?.logs || []).map((log) => ({
      id: log.request_id,
      type: log.kind,
      title: `${log.page || t('dashboardPage.activity.otherPage')} · ${t(`dashboardPage.activity.types.${log.kind}`)}`,
      detail: [log.worker?.full_name, log.user?.full_name].filter(Boolean).join(' · '),
      at: log.at
    }))
  )

  const title = computed(() => data.value?.organization?.name ?? props.organization?.name ?? '')
  const subtitle = computed(() =>
    t('dashboardPage.activity.workersCount', {
      n: formatCount(data.value?.organization?.workers ?? props.organization?.workers ?? 0)
    })
  )

  const pad = (n) => String(n).padStart(2, '0')
  const formatDate = (d) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
  const formatDateTime = (value) => {
    const d = parseDbDate(value)
    return `${formatDate(d)}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const range = computed(() => {
    if (!daily.value.length) return ''
    return `${formatDate(daily.value[0].date)} – ${formatDate(daily.value.at(-1).date)}`
  })

  // Ma'lumot yuklangan vaqt — «10:42»
  const updated = computed(() =>
    loadedAt.value ? `${pad(loadedAt.value.getHours())}:${pad(loadedAt.value.getMinutes())}` : '—'
  )

  // ── Grafik geometriyasi (maket: 214px, nol chizig'i 188px, yuqori 28px) ──
  const AXIS_LEFT = 30
  const PLOT_TOP = 28
  const PLOT_HEIGHT = 160
  const ZERO = PLOT_TOP + PLOT_HEIGHT

  const scaleMax = computed(() => {
    const max = Math.max(0, ...daily.value.map((d) => d.value))
    return Math.max(30, Math.ceil(max / 3 / 10) * 10 * 3)
  })
  const ticks = computed(() => [3, 2, 1, 0].map((i) => (scaleMax.value / 3) * i))
  const tickTop = (value) => PLOT_TOP + (1 - value / scaleMax.value) * PLOT_HEIGHT
  const barHeight = (value) => `${Math.max(2, (value / scaleMax.value) * PLOT_HEIGHT)}px`

  const average = computed(() => data.value?.daily_avg ?? 0)

  const peakIndex = computed(() => {
    let best = -1
    daily.value.forEach((d, idx) => {
      if (best < 0 || d.value > daily.value[best].value) best = idx
    })
    return best
  })
  const peak = computed(() => {
    const d = daily.value[peakIndex.value]
    return d?.value ? d : null
  })

  const slotCenter = (idx) =>
    `calc(${AXIS_LEFT}px + (100% - ${AXIS_LEFT}px) * ${(idx + 0.5) / (daily.value.length || 1)})`
  const slotStart = (idx) =>
    `calc(${AXIS_LEFT}px + (100% - ${AXIS_LEFT}px) * ${idx / (daily.value.length || 1)})`

  // Oy almashadigan kunlar: vertikal ajratgich va ostida oy nomi
  const months = computed(() =>
    daily.value
      .map((d, idx) => ({ d, idx }))
      .filter(({ d, idx }) => idx === 0 || d.date.getDate() === 1)
      .map(({ d, idx }) => ({ idx, name: monthName(d.date.getMonth()) }))
  )

  const barClass = (d, idx) => {
    if (idx === peakIndex.value) return 'bg-fig-bg-brand'
    return d.off ? 'bg-fig-neutral-300' : 'bg-fig-bg-brand/55'
  }
  const labelClass = (d, idx) => {
    if (idx === peakIndex.value) return 'font-semibold text-fig-bg-brand'
    return d.off ? 'text-fig-neutral-300' : 'text-[#98a2b3]'
  }
</script>

<template>
  <n-modal v-model:show="visible" :auto-focus="false">
    <div
      v-if="organization"
      role="dialog"
      aria-modal="true"
      class="flex max-h-[calc(100dvh-32px)] w-[760px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[32px] bg-fig-block"
    >
      <!-- Header -->
      <div
        class="flex w-full shrink-0 items-center gap-6 border-b border-fig-bg-disable bg-fig-bg-tertiary px-8 py-2.5 max-sm:px-4"
      >
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-full bg-fig-blue-100"
          >
            <n-icon :component="Building20Regular" :size="20" class="text-fig-text-brand" />
          </span>
          <div class="flex min-w-0 flex-1 flex-col gap-[3px] whitespace-nowrap">
            <p class="truncate text-[18px] leading-6 font-semibold text-fig-text-primary">
              {{ title }}
            </p>
            <p class="truncate text-[12px] leading-4 text-fig-text-tertiary">{{ subtitle }}</p>
          </div>
        </div>
        <button
          type="button"
          class="flex shrink-0 cursor-pointer items-center rounded-full bg-fig-block p-1.5 transition-opacity hover:opacity-80"
          @click="visible = false"
        >
          <img :src="XmarkIcon" alt="" width="20" height="20" class="block rotate-180" />
        </button>
      </div>

      <!-- Content -->
      <n-spin :show="loading" class="min-h-0 w-full overflow-y-auto">
        <div class="flex w-full flex-col gap-4 px-6 py-4 max-sm:px-4">
          <div class="flex w-full flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2 whitespace-nowrap">
              <img :src="CalendarIcon" alt="" width="16" height="16" class="block shrink-0" />
              <p class="text-[13.5px] leading-5 font-semibold text-fig-text-primary">
                {{ $t('dashboardPage.activity.user.last30') }}
              </p>
              <p class="text-[13px] leading-5 text-fig-text-tertiary">{{ range }}</p>
            </div>
            <p class="text-[12px] leading-4 whitespace-nowrap text-[#98a2b3]">
              {{ $t('dashboardPage.activity.user.updated', { time: updated }) }}
            </p>
          </div>

          <!-- Oylik faollik -->
          <div class="flex w-full flex-col gap-4 rounded-2xl bg-fig-bg-secondary p-4">
            <div class="flex w-full flex-wrap items-center justify-between gap-2">
              <div class="flex min-w-0 flex-1 items-center gap-2.5">
                <span class="flex shrink-0 items-center rounded-full bg-fig-blue-100 p-1.5">
                  <img :src="HeadChartLine" alt="" width="20" height="20" class="block" />
                </span>
                <p class="truncate text-[14px] leading-[18px] font-semibold text-fig-text-primary">
                  {{ $t('dashboardPage.activity.monthly') }}
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <div class="flex items-center gap-1 rounded-xl bg-fig-block px-2 py-1.5">
                  <span class="size-2 shrink-0 rounded-full bg-fig-brand"></span>
                  <span class="text-[12px] leading-4 whitespace-nowrap text-fig-text-tertiary">
                    {{ $t('dashboardPage.activity.user.legendActions') }}
                  </span>
                </div>
                <div class="flex items-center gap-1 rounded-xl bg-fig-block px-2 py-1.5">
                  <img :src="LegendAvgLine" alt="" width="14" height="1" class="block" />
                  <span class="text-[12px] leading-4 whitespace-nowrap text-fig-text-tertiary">
                    {{ $t('dashboardPage.activity.user.legendAverage') }}
                  </span>
                </div>
                <div class="flex items-center gap-1 rounded-xl bg-fig-block px-2 py-1.5">
                  <span class="size-2 shrink-0 rounded-full bg-[#98a2b3]"></span>
                  <span class="text-[12px] leading-4 whitespace-nowrap text-fig-text-tertiary">
                    {{ $t('dashboardPage.activity.user.legendOff') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- `-mt-4 pt-4`: eng faol kun yorlig'i grafikdan yuqoriga chiqadi,
               skroll konteyneri uni kesib qo'ymasligi uchun joy -->
            <div class="-mt-4 w-full overflow-x-auto pt-4">
              <div class="relative h-[224px] w-full min-w-[560px]">
                <!-- Y o'qi -->
                <template v-for="tick in ticks" :key="tick">
                  <div
                    class="absolute right-0 h-px"
                    :class="tick === 0 ? 'bg-[#e4e9f2]' : 'bg-fig-bg-disable'"
                    :style="{ left: `${AXIS_LEFT}px`, top: `${tickTop(tick)}px` }"
                  ></div>
                  <p
                    class="absolute w-5 text-right text-[10.5px] leading-[14px] text-[#98a2b3]"
                    :style="{ left: 0, top: `${tickTop(tick) - 7}px` }"
                  >
                    {{ tick }}
                  </p>
                </template>

                <!-- Oy ajratgichi (birinchi oydan tashqari) va oy nomlari -->
                <template v-for="m in months" :key="m.idx">
                  <div
                    v-if="m.idx > 0"
                    class="absolute w-px bg-fig-br-disable"
                    :style="{ left: slotStart(m.idx), top: `${PLOT_TOP}px`, height: '194px' }"
                  ></div>
                  <p
                    class="absolute top-[212px] text-[10px] leading-3 font-medium whitespace-nowrap text-fig-text-tertiary"
                    :style="{
                      left: m.idx > 0 ? `calc(${slotStart(m.idx)} + 3px)` : `${AXIS_LEFT}px`
                    }"
                  >
                    {{ m.name }}
                  </p>
                </template>

                <!-- Ustunlar -->
                <div
                  class="absolute top-0 right-0 bottom-0 flex"
                  :style="{ left: `${AXIS_LEFT}px` }"
                >
                  <div v-for="(d, idx) in daily" :key="idx" class="relative min-w-0 flex-1">
                    <div
                      class="absolute left-1/2 w-3 -translate-x-1/2 rounded-t-[3px]"
                      :class="barClass(d, idx)"
                      :style="{
                        top: `calc(${ZERO}px - ${barHeight(d.value)})`,
                        height: barHeight(d.value)
                      }"
                    ></div>
                    <p
                      class="absolute top-[196px] left-1/2 -translate-x-1/2 text-[10px] leading-3 whitespace-nowrap"
                      :class="labelClass(d, idx)"
                    >
                      {{ d.date.getDate() }}
                    </p>
                  </div>
                </div>

                <!-- O'rtacha -->
                <img
                  :src="AvgLine"
                  alt=""
                  class="pointer-events-none absolute h-px"
                  :style="{
                    left: `${AXIS_LEFT}px`,
                    width: `calc(100% - ${AXIS_LEFT}px)`,
                    top: `${tickTop(average) - 1}px`
                  }"
                />
                <div
                  class="pointer-events-none absolute rounded-md border border-fig-br-disable bg-fig-block px-1.5 py-0.5"
                  :style="{ left: slotStart(5), top: `${tickTop(average) - 22}px` }"
                >
                  <p
                    class="text-[10.5px] leading-[14px] font-medium whitespace-nowrap text-fig-text-tertiary"
                  >
                    {{ $t('dashboardPage.activity.average', { n: formatCount(average) }) }}
                  </p>
                </div>

                <!-- Eng faol kun yorlig'i -->
                <div
                  v-if="peak"
                  class="pointer-events-none absolute flex -translate-x-1/2 flex-col items-center rounded-[7px] bg-[#101828] px-2 py-[5px] whitespace-nowrap"
                  :style="{
                    left: slotCenter(peakIndex),
                    top: `calc(${ZERO}px - ${barHeight(peak.value)} - 45px)`
                  }"
                >
                  <p class="text-[10.5px] leading-[14px] text-[#d0d5dd]">
                    {{
                      dayMonth(peak.date.getFullYear(), peak.date.getMonth(), peak.date.getDate())
                    }}
                  </p>
                  <p class="text-[12px] leading-4 font-semibold text-white">
                    {{ $t('dashboardPage.activity.totalUnit', { n: formatCount(peak.value) }) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Oxirgi amallar -->
          <div class="flex w-full flex-col gap-4 rounded-2xl bg-fig-bg-secondary p-4">
            <div class="flex w-full items-center justify-between">
              <p
                class="text-[14px] leading-[18px] font-semibold whitespace-nowrap text-fig-text-primary"
              >
                {{ $t('dashboardPage.activity.user.recent') }}
              </p>
            </div>

            <div class="flex w-full flex-col gap-1">
              <div
                v-for="(log, idx) in logs"
                :key="log.id"
                class="flex w-full items-center gap-3 py-2.5"
                :class="idx < logs.length - 1 && 'border-b border-fig-bg-disable'"
              >
                <span
                  class="flex size-8 shrink-0 items-center justify-center rounded-full"
                  :class="LOG_TYPES[log.type].bg"
                >
                  <img
                    :src="LOG_TYPES[log.type].icon"
                    alt=""
                    width="16"
                    height="16"
                    class="block"
                  />
                </span>
                <div class="flex min-w-0 flex-1 flex-col gap-px">
                  <p class="truncate text-[13px] leading-[18px] font-medium text-fig-text-primary">
                    {{ log.title }}
                  </p>
                  <p class="truncate text-[12px] leading-4 text-fig-text-tertiary">
                    {{ log.detail }}
                  </p>
                </div>
                <p class="shrink-0 text-[12px] leading-4 whitespace-nowrap text-[#98a2b3]">
                  {{ formatDateTime(log.at) }}
                </p>
              </div>
              <p
                v-if="!loading && !logs.length"
                class="py-6 text-center text-[13px] text-fig-text-tertiary"
              >
                {{ $t('dashboardPage.activity.empty') }}
              </p>
            </div>
          </div>
        </div>
      </n-spin>
    </div>
  </n-modal>
</template>
