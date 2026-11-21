<script setup>
  import { Checkmark12Filled, Dismiss12Filled } from '@vicons/fluent'
  import { UIPagination } from '@/components/index.js'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const store = useTurnstileDashboardStore()

  // Joriy oy (YYYY-MM) va bugungi kun — kelajakdagi kunlar bo'sh qoladi. Har daqiqada yangilanadi:
  // sahifa yarim tundan keyin ham ochiq tursa, «bugun» o'zi siljiydi.
  const clock = ref(new Date())
  let clockTimer = null
  onMounted(() => (clockTimer = setInterval(() => (clock.value = new Date()), 60 * 1000)))
  onBeforeUnmount(() => clearInterval(clockTimer))
  const currentMonth = computed(
    () => `${clock.value.getFullYear()}-${String(clock.value.getMonth() + 1).padStart(2, '0')}`
  )
  const todayDay = computed(() => (store.month.monthKey === currentMonth.value ? clock.value.getDate() : null))
  const isFutureDay = (day) => {
    const key = store.month.monthKey
    if (!key) return false
    if (key > currentMonth.value) return true
    if (key < currentMonth.value) return false
    return day > clock.value.getDate()
  }
  // Bugun hali kelmagan — «kelmadi» emas (smenasi keyinroq boshlanishi mumkin): kulrang «kutilmoqda»,
  // «Kelmadi» soniga qo'shilmaydi.
  const isPendingToday = (row, day) => day === todayDay.value && !row.cameSet.has(day)

  // O'lchamlar: xodim ustuni keng (ism to'liq ko'rinsin) va chapda qotirilgan, «Jami» o'ngda qotirilgan,
  // kunlar o'rtada gorizontal skroll qiladi. Qator balandligi hamma ustunda bir xil.
  const WORKER_W = 320
  const DAY_W = 44
  const STAT_W = 104 // «Keldi / Kelmadi» — bitta ustun
  const ROW_H = 44

  // Hafta kuni (Du, Se … Ya) va dam olish kunlari (shanba, yakshanba) — tanlangan oy bo'yicha.
  const WEEK_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthParts = computed(() => {
    const [y, m] = String(store.month.monthKey || '').split('-').map(Number)
    return { y, m }
  })
  const weekday = (day) => {
    const { y, m } = monthParts.value
    return y && m ? new Date(y, m - 1, day).getDay() : null
  }
  const isWeekend = (day) => [0, 6].includes(weekday(day))

  // Sarlavhadagi oy: «2026 Noyabr» («2026-11» o'rniga). Nom tarjimadan — til almashsa ham to'g'ri.
  const MONTH_KEYS = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ]
  const monthLabel = computed(() => {
    const { y, m } = monthParts.value
    return y && m ? `${y} ${i18n.global.t(`month.${MONTH_KEYS[m - 1]}`)}` : ''
  })

  // Qator yig'indisi — jadvalda ko'rinib turgan belgilar soni: yashil ✓ va qizil ✗ (dam olish kunlari ham;
  // bugun hali kelmaganlar va kelajak hisoblanmaydi).
  const counts = (row) => {
    let absent = 0
    for (const day of days.value) {
      if (isFutureDay(day) || row.cameSet.has(day) || day === todayDay.value) continue
      absent++
    }
    return { came: row.came_days.length, absent }
  }

  const days = computed(() => Array.from({ length: store.month.daysInMonth }, (_, i) => i + 1))
  const daysWidth = computed(() => DAY_W * store.month.daysInMonth)

  const fullName = (row) =>
    [row.user?.lastName, row.user?.firstName, row.user?.middleName].filter(Boolean).join(' ')

  // Kunlar maydoni, tepadagi kunlar sarlavhasi va pastdagi alohida skroll chizig'i bir-biriga bog'langan:
  // chiziq faqat kunlar ostida. Kunlarni trackpad / Shift+g'ildirak bilan surish ham hammasini yuritadi.
  const daysRef = ref(null)
  const headRef = ref(null)
  const barRef = ref(null)
  let syncing = false
  const syncFrom = (from) => {
    if (syncing || !from) return
    syncing = true
    for (const el of [daysRef.value, headRef.value, barRef.value]) {
      if (el && el !== from) el.scrollLeft = from.scrollLeft
    }
    requestAnimationFrame(() => (syncing = false))
  }
  const onDaysScroll = () => syncFrom(daysRef.value)
  const onBarScroll = () => syncFrom(barRef.value)

  // Sichqoncha bilan surish: jadval tanasida (yoki kunlar sarlavhasida) bosib turib tortish.
  // Chapga/o'ngga — kunlar suriladi, yuqoriga/pastga — qatorlar (sarlavhada faqat gorizontal).
  // Surish paytida matn belgilanmaydi, kursor «ushlash» ko'rinishida.
  const dragging = ref(false)
  let dragStartX = 0
  let dragStartY = 0
  let dragStartLeft = 0
  let dragStartTop = 0
  let dragVertical = false
  const onDragMove = (e) => {
    if (daysRef.value) daysRef.value.scrollLeft = dragStartLeft - (e.clientX - dragStartX)
    if (dragVertical && bodyRef.value) bodyRef.value.scrollTop = dragStartTop - (e.clientY - dragStartY)
  }
  const onDragEnd = () => {
    dragging.value = false
    window.removeEventListener('mousemove', onDragMove)
    window.removeEventListener('mouseup', onDragEnd)
  }
  const startDrag = (e, vertical) => {
    if (e.button !== 0 || !daysRef.value) return
    e.preventDefault()
    dragging.value = true
    dragVertical = vertical
    dragStartX = e.clientX
    dragStartY = e.clientY
    dragStartLeft = daysRef.value.scrollLeft
    dragStartTop = bodyRef.value?.scrollTop || 0
    window.addEventListener('mousemove', onDragMove)
    window.addEventListener('mouseup', onDragEnd)
  }
  const onBodyDragStart = (e) => startDrag(e, true)
  const onHeadDragStart = (e) => startDrag(e, false)
  onBeforeUnmount(onDragEnd)

  // Karta oynaning pastigacha cho'ziladi (ostida bo'sh joy qolmasin): balandlik = oyna − kartaning tepasi − pastki bo'shliq.
  const cardRef = ref(null)
  const cardHeight = ref(null)
  const BOTTOM_GAP = 24
  const measureCard = () => {
    const el = cardRef.value
    if (!el) return
    cardHeight.value = Math.max(window.innerHeight - el.getBoundingClientRect().top - BOTTOM_GAP, 360)
  }
  onMounted(() => {
    nextTick(measureCard)
    window.addEventListener('resize', measureCard)
  })
  onBeforeUnmount(() => window.removeEventListener('resize', measureCard))

  // Tanadagi vertikal skroll chizig'i eni — sarlavha va pastki chiziq o'ngdan shuncha surilsa,
  // uchala qism ustunlari aniq bir chiziqda turadi.
  const bodyRef = ref(null)
  const gutter = ref(0)
  const measureGutter = () => {
    const el = bodyRef.value
    gutter.value = el ? el.offsetWidth - el.clientWidth : 0
  }
  let resizeObserver = null
  onMounted(() => {
    resizeObserver = new ResizeObserver(measureGutter)
    if (bodyRef.value) resizeObserver.observe(bodyRef.value)
  })
  onBeforeUnmount(() => resizeObserver?.disconnect())
  watch(
    () => store.month.list,
    () => nextTick(measureGutter)
  )

  let timer = null
  const onSearch = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      store.monthParams.page = 1
      store._attendanceMonth()
    }, 500)
  }

  const onChangeMonth = () => {
    store.monthParams.page = 1
    store._attendanceMonth()
  }

  // Dastlab oy tanlagichi dashboard sanasining oyida.
  if (!store.monthParams.month) {
    store.monthParams.month = store.dashboardParams.date || Date.now()
  }

  const onChangePage = (v) => {
    store.monthParams.page = v.page
    store.monthParams.per_page = v.per_page
    store._attendanceMonth()
  }
</script>

<template>
  <div
    ref="cardRef"
    class="bg-surface-section shadow-card rounded-2xl p-3 flex flex-col gap-3"
    :style="cardHeight ? { height: `${cardHeight}px` } : null"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <n-date-picker
          v-model:value="store.monthParams.month"
          type="month"
          format="MM.yyyy"
          class="!w-[150px]"
          :clearable="false"
          :placeholder="$t('turnStileDashboard.month.pick')"
          @update:value="onChangeMonth"
        />
        <p class="text-[14px] leading-[20px] font-medium text-fig-text-primary">
          {{ $t('turnStileDashboard.month.title', { month: monthLabel }) }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1.5 text-[12px] text-fig-text-secondary">
          <span class="h-3 w-3 rounded-[4px]" style="background-color: var(--fig-icon-green)"></span>
          {{ $t('turnStileDashboard.month.came') }}
        </span>
        <span class="flex items-center gap-1.5 text-[12px] text-fig-text-secondary">
          <span class="h-3 w-3 rounded-[4px]" style="background-color: var(--fig-icon-red)"></span>
          {{ $t('turnStileDashboard.month.absent') }}
        </span>
        <span class="flex items-center gap-1.5 text-[12px] text-fig-text-secondary">
          <span class="att-month__weekend-dot h-3 w-3 rounded-[4px]"></span>
          {{ $t('turnStileDashboard.attendance.day_off') }}
        </span>
        <n-input
          v-model:value="store.monthParams.search"
          clearable
          class="!w-[260px]"
          :placeholder="$t('content.search')"
          @update:value="onSearch"
        />
      </div>
    </div>

    <!-- Uch qism: xodim (chapda qotirilgan) | kunlar (gorizontal skroll) | Keldi / Kelmadi (o'ngda qotirilgan).
         Sarlavha qatori tanadan tashqarida (vertikal skrollda joyida qoladi), kunlar sarlavhasi
         kunlar bilan birga suriladi. Gorizontal skroll chizig'i pastda, faqat kunlar ostida.
         Jadval kartaning qolgan balandligini to'ldiradi. -->
    <n-spin :show="store.month.loading" class="min-h-0 flex-1" content-class="h-full">
      <div class="flex h-full flex-col overflow-hidden rounded-xl border border-fig-br-disable">
        <!-- sarlavha: hafta kuni + sana -->
        <div class="att-month__head flex shrink-0" :style="{ paddingRight: `${gutter}px` }">
          <div class="flex shrink-0 items-center border-r border-fig-br-disable px-3" :style="{ width: `${WORKER_W}px` }">
            {{ $t('content.worker') }}
          </div>
          <div
            ref="headRef"
            class="att-month__days att-month__drag min-w-0 flex-1 overflow-x-hidden"
            :class="dragging && 'is-dragging'"
            @mousedown="onHeadDragStart"
          >
            <div class="flex h-full" :style="{ width: `${daysWidth}px` }">
              <!-- Tabel jadvalidagi kabi: tepada sana, ostida hafta kuni -->
              <div
                v-for="day in days"
                :key="day"
                class="att-month__day-head flex shrink-0 flex-col items-center justify-center border-r border-fig-br-disable"
                :class="[
                  isWeekend(day) && 'is-weekend',
                  day === todayDay && 'is-today'
                ]"
                :style="{ width: `${DAY_W}px` }"
              >
                <span class="att-month__day-num">{{ day }}</span>
                <span class="att-month__day-week">
                  {{ weekday(day) != null ? $t(`shortWeek.${WEEK_KEYS[weekday(day)]}`) : '' }}
                </span>
              </div>
            </div>
          </div>
          <div
            class="flex shrink-0 items-center justify-center gap-1 border-l border-fig-br-disable"
            :style="{ width: `${STAT_W}px` }"
          >
            <span :style="{ color: 'var(--fig-icon-green)' }">{{ $t('turnStileDashboard.month.came') }}</span>
            <span class="text-fig-text-disable">/</span>
            <span :style="{ color: 'var(--fig-icon-red)' }">{{ $t('turnStileDashboard.month.absent') }}</span>
          </div>
        </div>

        <!-- tana: qolgan balandlikni to'ldiradi, vertikal skroll; bosib turib tortish — ikki yo'nalishda -->
        <div
          ref="bodyRef"
          class="att-month__drag min-h-0 flex-1 overflow-y-auto"
          :class="dragging && 'is-dragging'"
          @mousedown="onBodyDragStart"
        >
          <div class="flex">
            <!-- xodim ustuni -->
            <div class="shrink-0 border-r border-fig-br-disable" :style="{ width: `${WORKER_W}px` }">
              <div
                v-for="row in store.month.list"
                :key="row.id"
                class="att-month__cell flex-col !items-start justify-center px-3"
                :style="{ height: `${ROW_H}px` }"
              >
                <p
                  class="w-full truncate text-[13px] leading-[18px] font-medium text-fig-text-primary"
                  :title="row.user?.position ? `${fullName(row)} — ${row.user.position}` : fullName(row)"
                >
                  {{ fullName(row) }}
                </p>
                <p class="w-full truncate text-[11px] leading-[14px] text-fig-text-tertiary">
                  {{ row.user?.position || '' }}
                </p>
              </div>
            </div>

            <!-- kunlar: har katak ustun chizig'i bilan; shanba/yakshanba och qizil fonda -->
            <div ref="daysRef" class="att-month__days min-w-0 flex-1 overflow-x-auto" @scroll="onDaysScroll">
              <div :style="{ width: `${daysWidth}px` }">
                <div v-for="row in store.month.list" :key="row.id" class="flex">
                  <div
                    v-for="day in days"
                    :key="day"
                    class="att-month__cell att-month__day shrink-0 justify-center border-r border-fig-br-disable"
                    :class="[isWeekend(day) && 'is-weekend', day === todayDay && 'is-today']"
                    :style="{ width: `${DAY_W}px`, height: `${ROW_H}px` }"
                  >
                    <template v-if="!isFutureDay(day)">
                      <!-- bugun, hali kelmagan — kutilmoqda -->
                      <span
                        v-if="isPendingToday(row, day)"
                        class="inline-block h-[22px] w-[22px] rounded-[6px] border-2 border-dashed border-fig-br-disable"
                        :title="$t('turnStileDashboard.attendanceReason.not_started')"
                      ></span>
                      <span
                        v-else
                        class="inline-flex h-[22px] w-[22px] items-center justify-center rounded-[6px] text-white"
                        :style="{ backgroundColor: row.cameSet.has(day) ? 'var(--fig-icon-green)' : 'var(--fig-icon-red)' }"
                        :title="row.cameSet.has(day) ? $t('turnStileDashboard.month.came') : $t('turnStileDashboard.month.absent')"
                      >
                        <n-icon size="12">
                          <Checkmark12Filled v-if="row.cameSet.has(day)" />
                          <Dismiss12Filled v-else />
                        </n-icon>
                      </span>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- Keldi / Kelmadi — bitta ustunda: yashil / qizil -->
            <div class="shrink-0 border-l border-fig-br-disable" :style="{ width: `${STAT_W}px` }">
              <div
                v-for="row in store.month.list"
                :key="row.id"
                class="att-month__cell justify-center gap-1.5 text-[15px] font-bold"
                :style="{ height: `${ROW_H}px` }"
              >
                <span :style="{ color: 'var(--fig-icon-green)' }">{{ counts(row).came }}</span>
                <span class="text-[13px] font-normal text-fig-text-disable">/</span>
                <span :style="{ color: 'var(--fig-icon-red)' }">{{ counts(row).absent }}</span>
              </div>
            </div>
          </div>

          <p
            v-if="!store.month.list.length && !store.month.loading"
            class="py-10 text-center text-[13px] text-fig-text-tertiary"
          >
            {{ $t('content.notFoundData') }}
          </p>
        </div>

        <!-- gorizontal skroll chizig'i — faqat kunlar ostida -->
        <div class="flex shrink-0 border-t border-fig-br-disable" :style="{ paddingRight: `${gutter}px` }">
          <div class="shrink-0 border-r border-fig-br-disable" :style="{ width: `${WORKER_W}px` }"></div>
          <div ref="barRef" class="att-month__bar min-w-0 flex-1 overflow-x-auto" @scroll="onBarScroll">
            <div :style="{ width: `${daysWidth}px`, height: '1px' }"></div>
          </div>
          <div class="shrink-0 border-l border-fig-br-disable" :style="{ width: `${STAT_W}px` }"></div>
        </div>
      </div>
    </n-spin>

    <UIPagination
      :page="store.monthParams.page"
      :per_page="store.monthParams.per_page"
      :total="store.month.total"
      @change-page="onChangePage"
    />
  </div>
</template>

<style scoped>
  /* Sarlavha qatori (tanadan tashqarida — vertikal skrollda joyida qoladi). */
  .att-month__head {
    display: flex;
    align-items: stretch;
    height: 48px;
    background: var(--fig-bg-secondary);
    border-bottom: 1px solid var(--fig-br-disable);
    font-size: 13px;
    font-weight: 500;
    color: var(--fig-text-secondary);
  }

  .att-month__cell {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--fig-br-disable);
    background: var(--fig-block-bg);
  }

  /* Shanba / yakshanba — Tabel jadvalidagi kabi `--schedule-weekend-bg` fon; sarlavhada qizil matn.
     Bugun — sarlavha ostida ko'k chiziq va ko'k raqam, ustun ko'kish fonda. */
  .att-month__day.is-weekend,
  .att-month__day-head.is-weekend {
    background: var(--schedule-weekend-bg);
  }

  .att-month__day-num {
    display: block;
    font-size: 14px;
    line-height: 16px;
    font-weight: 600;
    color: var(--fig-text-primary);
  }

  .att-month__day-week {
    display: block;
    font-size: 11px;
    line-height: 12px;
    color: var(--fig-text-tertiary);
  }

  .att-month__day-head.is-weekend .att-month__day-num,
  .att-month__day-head.is-weekend .att-month__day-week {
    color: var(--fig-text-red);
  }

  .att-month__day-head.is-today {
    box-shadow: inset 0 -2px 0 var(--fig-icon-brand);
  }

  .att-month__day-head.is-today .att-month__day-num {
    color: var(--fig-text-brand);
  }

  .att-month__day.is-today {
    background: color-mix(in srgb, var(--fig-icon-brand) 10%, var(--fig-block-bg));
  }

  .att-month__weekend-dot {
    background: var(--schedule-weekend-bg);
    border: 1px solid color-mix(in srgb, var(--fig-icon-red) 35%, transparent);
  }

  /* Kunlar maydonining o'z chizig'i yashirin — pastdagi alohida chiziq ishlatiladi. */
  .att-month__days {
    scrollbar-width: none;
  }

  .att-month__days::-webkit-scrollbar {
    display: none;
  }

  /* Sichqoncha bilan surish — «ushlash» kursori, surish paytida matn belgilanmaydi. */
  .att-month__drag {
    cursor: grab;
  }

  .att-month__drag.is-dragging {
    cursor: grabbing;
    user-select: none;
  }

  .att-month__bar {
    height: 14px;
    scrollbar-color: auto;
  }
</style>
