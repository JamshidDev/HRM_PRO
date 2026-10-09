<script setup>
  import { useAccountStore, useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import SearchElement from '@/pages/turnstile/schedule/ui/SearchElement.vue'
  import Utils from '@/utils/Utils.js'
  import { MoreHorizontal32Filled } from '@vicons/fluent'
  import { UIPagination } from '@components'
  import { isRotating, navbatOf, patternOf } from './navbat.js'

  const store = useScheduleGroupWorkerStore()
  const accStore = useAccountStore()

  const currentScheduleList = ref([])

  const rotating = computed(() => isRotating(store.shiftType))
  const pattern = computed(() => patternOf(store.shiftType))
  // Smena davri (start..end) — undan tashqaridagi kunlar xiralashtiriladi.
  const inPeriod = (date) =>
    (!store.params.startDate || date >= String(store.params.startDate).slice(0, 10)) &&
    (!store.params.endDate || date <= String(store.params.endDate).slice(0, 10))

  watchEffect(() => {
    const offset = (store.params.page - 1) * store.params.per_page
    const rows = store.list.map((v) => {
      const fullName = Utils.combineFullName(v)
      return {
        workerId: v.worker_id,
        workerPositionId: v.worker_position_id,
        fullName,
        position: v.position_name,
        navbat: rotating.value ? navbatOf(v.days, pattern.value) : null,
        days: v.days.map((e) => ({
          date: e.date,
          isWorkDay: e.work_status,
          startTime: e.start_time || null,
          endTime: e.end_time || null,
          workTime: e.daily_minutes,
          isEmpty: e.id === null,
          inPeriod: inPeriod(e.date)
        }))
      }
    })
    // Aylanma smenada navbat tartibida — kim qaysi navbatda ekani ko'rinsin.
    if (rotating.value) {
      rows.sort(
        (a, b) => (a.navbat ?? 99) - (b.navbat ?? 99) || a.fullName.localeCompare(b.fullName)
      )
    }
    currentScheduleList.value = rows.map((r, i) => ({ ...r, number: offset + i + 1 }))
  })

  const headerInPeriod = computed(() =>
    (currentScheduleList.value[0]?.days ?? []).map((d) => d.inPeriod)
  )

  // Backend `schedule-workers` `search` parametrini qo'llamaydi — guruh xodimlari bitta
  // sahifada keladi (store'da per_page katta) va qidiruv brauzerda bajariladi.
  const visibleList = computed(() => {
    const q = store.params.search?.trim().toLowerCase()
    if (!q) return currentScheduleList.value
    return currentScheduleList.value.filter(
      (v) => v.fullName?.toLowerCase().includes(q) || v.position?.toLowerCase().includes(q)
    )
  })

  const calculateWorkTime = (worker) => {
    const totalMinute = worker.days.reduce((sum, item) => sum + item.workTime, 0)
    return Math.floor(totalMinute / 60)
  }

  const onChangePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onReplace = (v) => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    store.selectedWorker = v
    store._workers()
    store.replacePayload.positonId = null
    store.replacePayload.date = new Date().getTime()
    store.replaceVisible = true
  }
</script>

<template>
  <n-spin :show="store.dayOfMonthLoading || store.loading" class="h-full">
    <div class="h-full flex flex-col gap-4">
      <div class="w-full flex-1 overflow-auto relative rounded-lg">
        <div class="schedule-header-row flex z-[10] w-fit min-w-full sticky top-0">
          <div
            class="rounded-tl-lg border-r border-t border-l border-b border-surface-line p-2 w-[60px] min-w-[60px] h-[50px] sticky left-0 top-0 z-[20] bg-surface-section flex-shrink-0"
          >
            N0
          </div>
          <div
            class="border-r border-t border-l-[0] border-b border-surface-line flex text-secondary font-medium justify-center items-center w-[320px] min-w-[340px] h-[50px] sticky left-[60px] top-0 z-[20] bg-surface-section flex-shrink-0"
          >
            <SearchElement :disable="true" />
          </div>
          <template v-for="(item, hIndex) in store.dayOfMonth" :key="`header-${item}`">
            <div
              :class="{ 'opacity-40': headerInPeriod[hIndex] === false }"
              :title="headerInPeriod[hIndex] === false ? $t('shiftType.groupView.outOfPeriod') : null"
              :style="{
                background: [6, 0].includes(item.weekDay)
                  ? 'var(--schedule-weekend-bg)'
                  : 'var(--schedule-weekday-bg)'
              }"
              class="border-r border-t border-l border-b -ml-[1px] border-surface-line w-[60px] min-w-[60px] h-[50px] text-xs text-secondary flex-shrink-0"
            >
              <div class="text-center p-1 font-bold">{{ item?.day }}</div>
              <div class="text-center p-1">{{ store.shortNameOfWeek[item.weekDay] || '-' }}</div>
            </div>
          </template>
          <div
            class="rounded-tr-lg border-r border-t border-l border-b -ml-[1px] text-xs text-secondary flex justify-center items-center p-2 border-surface-line w-[80px] min-w-[80px] h-[50px] sticky right-0 top-0 bg-surface-section flex-shrink-0 z-[20]"
          >
            {{ $t('schedule.form.workTime') }}
          </div>
        </div>
        <template v-if="visibleList.length > 0">
          <div
            v-for="worker in visibleList"
            :key="worker.workerPositionId"
            class="schedule-header-body-row flex w-fit min-w-full bg-surface-section"
          >
            <!-- Worker Name - Sticky Left -->
            <div
              class="border-r border-l border-b border-t-0 border-surface-line text-center p-2 w-[60px] min-w-[60px] h-[50px] border sticky left-0 bg-surface-section flex-shrink-0 z-[5] flex items-center justify-center"
            >
              <span class="leading-[1.2] text-secondary font-medium">{{ worker.number }}</span>
            </div>
            <div
              class="border-r border-l-[0] border-b border-t-0 border-surface-line p-2 w-[340px] min-w-[320px] h-[50px] border sticky left-[60px] bg-surface-section flex-shrink-0 z-[5] flex items-center"
            >
              <div class="w-[calc(100%-28px)]">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span
                    v-if="rotating"
                    class="shrink-0 text-[11px] leading-none px-1.5 py-0.5 rounded"
                    :class="worker.navbat ? 'bg-primary/10 text-primary' : 'bg-surface-line text-secondary'"
                    :title="worker.navbat ? null : $t('shiftType.groupView.unknownNavbat')"
                  >
                    {{ worker.navbat ? $t('shiftType.groupView.navbat', { n: worker.navbat }) : '?' }}
                  </span>
                  <span class="line-clamp-1 leading-[1.2] font-medium">{{ worker.fullName }}</span>
                </div>
                <div class="text-xs line-clamp-1 leading-[1.2] text-secondary">
                  {{ worker.position }}
                </div>
              </div>

              <div
                v-if="accStore.checkPermission(accStore.pn.turnstileSheetsGroupsWrite)"
                @click="onReplace(worker)"
                class="w-[28px] h-[28px] border border-surface-line rounded-lg flex justify-center items-center text-secondary cursor-pointer"
              >
                <n-icon size="20">
                  <MoreHorizontal32Filled />
                </n-icon>
              </div>
            </div>

            <!-- Day Cells -->
            <div
              v-for="(day, dayIndex) in worker.days"
              :key="dayIndex"
              class="border-r text-center border-l border-b border-t-0 -ml-[1px] border-surface-line w-[60px] min-w-[60px] h-[50px] border text-xs text-secondary p-2 pb-0 flex-shrink-0 cursor-pointer relative"
              :class="{ 'out-of-period': !day.inPeriod }"
              :title="!day.inPeriod ? $t('shiftType.groupView.outOfPeriod') : null"
            >
              <template v-if="day.isEmpty"></template>
              <template v-else-if="day.isWorkDay">
                <div class="leading-[1.2] pt-3">{{ day.startTime }}</div>
                <div class="leading-[1.2]">{{ day.endTime }}</div>
                <div
                  class="absolute top-[0] left-[0] min-w-[16px] h-[16px] px-0.5 bg-secondary/80 text-white text-xs rounded"
                  :title="$t('shiftType.groupView.hours', { n: Math.floor(day.workTime / 60) })"
                >
                  {{ Math.floor(day.workTime / 60) }}
                </div>
              </template>
              <template v-else>
                <div class="h-full flex items-center justify-center pb-2 text-success/80 font-medium">
                  {{ $t('shiftType.groupView.rest') }}
                </div>
              </template>
            </div>

            <!-- Total - Sticky Right -->
            <div
              class="border-r border-l border-b -ml-[1px] border-surface-line w-[80px] min-w-[80px] h-[50px] sticky right-0 bg-surface-section flex-shrink-0 z-[5] flex items-center justify-center"
            >
              {{ calculateWorkTime(worker) }}
            </div>
          </div>
        </template>
        <template v-else>
          <div
            class="w-full text-center h-[300px] sticky left-0 flex justify-center items-center text-secondary"
          >
            {{ $t('content.no-data') }}
          </div>
        </template>
      </div>

      <UIPagination
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="onChangePage"
        :show-size-picker="false"
      />
    </div>
  </n-spin>
</template>

<style scoped>
  .out-of-period {
    background: repeating-linear-gradient(
      -45deg,
      transparent 0 6px,
      var(--schedule-weekend-bg) 6px 8px
    );
    opacity: 0.55;
  }
</style>
