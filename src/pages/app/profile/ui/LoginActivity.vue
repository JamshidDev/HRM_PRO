<script setup>
  // GitHub'dagi kabi faollik xaritasi: har bir katak — bir kun, rang — o'sha kungi
  // kirishlar soni. Hozircha manba — `/v1/sso/logins` (HRM orqali boshqa tizimlarga
  // kirishlar). Backend kunlik faollik (masalan, foydalanilgan soat) bersa —
  // faqat `loadYear` va `levelOf` almashtiriladi.
  import dayjs from 'dayjs'
  import CalendarDaysIcon from '@/assets/icons/calendarDaysIcon.svg'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'

  const { t } = i18n.global
  const accStore = useAccountStore()
  const avatarSrc = computed(
    () => accStore.account?.worker?.photo || useAppSetting.noAvailableImage
  )
  const worker = computed(() => accStore.account?.worker)

  // Hozircha hamma joyda (prod ham) demo ma'lumot — backend kunlik faollik endpoint'i
  // tayyor bo'lgach `false` qilinadi (yoki mock butunlay olib tashlanadi).
  const USE_MOCK = true

  const PER_PAGE = 100
  // Ro'yxat yangidan eskiga keladi; yil boshidan o'tganda to'xtaymiz. Cheklov — xavfsizlik uchun.
  const MAX_PAGES = 30

  const today = dayjs()
  const currentYear = today.year()
  const years = [currentYear, currentYear - 1]

  const year = ref(currentYear)
  const counts = ref({}) // 'YYYY-MM-DD' → kirishlar soni
  const loading = ref(false)
  const cache = new Map()
  let loadToken = 0

  // Bir xil yil uchun har safar bir xil "tasodifiy" natija.
  const mockYear = (y) => {
    let seed = y * 31
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    const result = {}
    let d = dayjs(`${y}-01-01`)
    while (d.year() === y && !d.isAfter(today, 'day')) {
      const weekend = d.day() === 0 || d.day() === 6
      const r = rand()
      const count = weekend ? (r > 0.85 ? 1 : 0) : r > 0.25 ? Math.floor(r * 7) : 0
      if (count) result[d.format('YYYY-MM-DD')] = count
      d = d.add(1, 'day')
    }
    return result
  }

  const loadYear = async (y) => {
    if (USE_MOCK) return mockYear(y)
    const from = dayjs(`${y}-01-01`)
    const result = {}
    let fetched = 0
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await $ApiService.accountService._ssoLogins({
        params: { page, per_page: PER_PAGE }
      })
      const items = res.data.data.data || []
      const total = res.data.data.total ?? 0
      items.forEach((item) => {
        const d = dayjs(item.created_at)
        if (d.year() !== y) return
        const key = d.format('YYYY-MM-DD')
        result[key] = (result[key] || 0) + 1
      })
      fetched += items.length
      const last = items.at(-1)
      if (!items.length || fetched >= total || dayjs(last.created_at).isBefore(from)) break
    }
    return result
  }

  const load = async () => {
    const key = year.value
    if (cache.has(key)) {
      counts.value = cache.get(key)
      return
    }
    const token = ++loadToken
    loading.value = true
    try {
      const result = await loadYear(year.value)
      cache.set(key, result)
      if (token === loadToken) counts.value = result
    } finally {
      if (token === loadToken) loading.value = false
    }
  }

  watch(year, load, { immediate: true })

  // 0 — bo'sh, 1..4 — rang darajalari.
  const levelOf = (count) =>
    count <= 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 3 : 4
  const levelClass = [
    'bg-surface-ground',
    'bg-primary/25',
    'bg-primary/45',
    'bg-primary/70',
    'bg-primary'
  ]
  const levelLabels = computed(() => [
    t('ssoLogins.activity.none'),
    t('ssoLogins.activity.count', { count: 1 }),
    t('ssoLogins.activity.count', { count: 2 }),
    t('ssoLogins.activity.count', { count: '3–4' }),
    t('ssoLogins.activity.count', { count: '5+' })
  ])

  const monthNames = computed(() => t('ssoLogins.activity.months').split(','))
  const dayNames = computed(() => t('ssoLogins.activity.days').split(','))

  // Haftalar — ustunlar (dushanbadan boshlanadi), kunlar — qatorlar. Yildan tashqari kunlar — null.
  const weeks = computed(() => {
    const y = year.value
    const start = dayjs(`${y}-01-01`)
    const end = dayjs(`${y}-12-31`)
    let d = start.subtract((start.day() + 6) % 7, 'day')
    const out = []
    while (!d.isAfter(end, 'day')) {
      const week = []
      for (let i = 0; i < 7; i++) {
        if (d.year() === y) {
          const key = d.format('YYYY-MM-DD')
          const count = counts.value[key] || 0
          week.push({ key, date: d, count, level: levelOf(count), future: d.isAfter(today, 'day') })
        } else {
          week.push(null)
        }
        d = d.add(1, 'day')
      }
      out.push(week)
    }
    return out
  })

  // Oy nomi — shu oyning 1-kuni tushgan ustun ustida (+2: birinchi ustun — hafta kunlari).
  const monthLabels = computed(() =>
    weeks.value
      .map((week, col) => {
        const first = week.find((day) => day?.date.date() === 1)
        return first ? { col: col + 2, name: monthNames.value[first.date.month()] } : null
      })
      .filter(Boolean)
  )

  // Katakchalar kartaning butun kengligini egallaydi; tor ekranda 12px dan kichraymaydi.
  const gridStyle = computed(() => ({
    gridTemplateColumns: `auto repeat(${weeks.value.length}, minmax(12px, 1fr))`,
    minWidth: `${weeks.value.length * 16 + 32}px`
  }))

  const fmtDate = (d) => `${d.date()} ${monthNames.value[d.month()]} ${d.year()}`

  const stats = computed(() => {
    const days = weeks.value.flat().filter((day) => day && !day.future)
    let streak = 0
    let run = 0
    let busiest = null
    days.forEach((day) => {
      run = day.count ? run + 1 : 0
      streak = Math.max(streak, run)
      if (day.count && (!busiest || day.count > busiest.count)) busiest = day
    })
    return {
      total: days.reduce((sum, day) => sum + day.count, 0),
      activeDays: days.filter((day) => day.count).length,
      streak,
      busiest
    }
  })

  // Bitta umumiy tooltip — 365 ta tooltip komponenti o'rniga.
  const tip = reactive({ show: false, x: 0, y: 0, title: '', date: '' })
  const onEnter = (e, day) => {
    const rect = e.target.getBoundingClientRect()
    tip.x = rect.left + rect.width / 2
    tip.y = rect.top
    tip.title = day.count
      ? t('ssoLogins.activity.count', { count: day.count })
      : t('ssoLogins.activity.none')
    tip.date = fmtDate(day.date)
    tip.show = true
  }
  const onLeave = () => {
    tip.show = false
  }

  const guide = computed(() => [
    { title: t('ssoLogins.activity.guide.howTitle'), text: t('ssoLogins.activity.guide.howText') },
    {
      title: t('ssoLogins.activity.guide.hoverTitle'),
      text: t('ssoLogins.activity.guide.hoverText')
    },
    {
      title: t('ssoLogins.activity.guide.privateTitle'),
      text: t('ssoLogins.activity.guide.privateText')
    },
    { title: t('ssoLogins.activity.guide.soonTitle'), text: t('ssoLogins.activity.guide.soonText') }
  ])
</script>

<template>
  <SectionHeader :title="$t('ssoLogins.activity.title')" :icon="CalendarDaysIcon" large>
    <template #title-suffix>
      <span
        v-if="USE_MOCK"
        class="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary"
      >
        {{ $t('ssoLogins.activity.demo') }}
      </span>
    </template>
    <template #trailing>
      <div class="flex items-center gap-1">
        <n-button
          v-for="y in years"
          :key="y"
          size="small"
          :type="year === y ? 'primary' : 'default'"
          :quaternary="year !== y"
          @click="year = y"
        >
          {{ y }}
        </n-button>
      </div>
    </template>

    <p class="text-base font-semibold text-textColor0 tabular-nums mb-4">
      {{ $t('ssoLogins.activity.total', { count: stats.total, year }) }}
    </p>

    <n-spin :show="loading">
      <div class="overflow-x-auto pb-1 activity-scroll">
        <div class="grid gap-[4px]" :style="gridStyle" @mouseleave="onLeave">
          <!-- 1-qator: oylar -->
          <span
            v-for="m in monthLabels"
            :key="`m-${m.col}`"
            class="whitespace-nowrap text-xs text-textColor3 pb-1"
            :style="{ gridRow: 1, gridColumnStart: m.col }"
          >
            {{ m.name }}
          </span>
          <!-- 1-ustun: hafta kunlari (GitHub kabi Du / Ch / Ju) -->
          <span
            v-for="(name, i) in dayNames"
            :key="`d-${i}`"
            class="pr-2 text-xs text-textColor3 self-center"
            :style="{ gridRow: i + 2, gridColumn: 1 }"
          >
            {{ i % 2 === 0 && i < 6 ? name : '' }}
          </span>
          <!-- Kunlar -->
          <template v-for="(week, wi) in weeks" :key="wi">
            <span
              v-for="(day, di) in week"
              :key="day?.key ?? `${wi}-${di}`"
              class="aspect-square rounded-[4px] transition-transform duration-100"
              :class="
                day
                  ? [
                      levelClass[day.level],
                      day.future ? 'opacity-40' : 'hover:scale-125 hover:ring-1 hover:ring-primary'
                    ]
                  : ''
              "
              :style="{ gridRow: di + 2, gridColumn: wi + 2 }"
              @mouseenter="(e) => day && !day.future && onEnter(e, day)"
            ></span>
          </template>
        </div>
      </div>

      <div class="flex items-center justify-end gap-1 mt-3 text-xs text-textColor3">
        <span class="mr-1">{{ $t('ssoLogins.activity.less') }}</span>
        <span v-for="c in levelClass" :key="c" class="w-3 h-3 rounded-[3px]" :class="c"></span>
        <span class="ml-1">{{ $t('ssoLogins.activity.more') }}</span>
      </div>
    </n-spin>

    <div class="flex items-start gap-6 mt-5">
      <!-- Profil rasmi — ko'rsatkichlar va yo'riqnoma yonida (tor ekranda yashiriladi) -->
      <div class="hidden md:block w-[210px] shrink-0">
        <img
          class="w-full aspect-[3/4] rounded-2xl object-cover object-top"
          :src="avatarSrc"
          :alt="worker?.first_name"
          @error="Utils.onImgError"
        />
        <p class="mt-3 text-center text-lg font-semibold leading-6 text-textColor0">
          {{ [worker?.last_name, worker?.first_name].filter(Boolean).join(' ') }}
        </p>
        <p v-if="worker?.middle_name" class="text-center text-base text-textColor3">{{ worker.middle_name }}</p>
      </div>
      <div class="flex-1 min-w-0">
        <!-- Qisqa ko'rsatkichlar -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div class="rounded-2xl bg-surface-ground px-4 py-3">
            <p class="text-xs text-textColor3">{{ $t('ssoLogins.activity.stats.total') }}</p>
            <p class="mt-1 text-xl font-semibold text-textColor0 tabular-nums">{{ stats.total }}</p>
          </div>
          <div class="rounded-2xl bg-surface-ground px-4 py-3">
            <p class="text-xs text-textColor3">{{ $t('ssoLogins.activity.stats.activeDays') }}</p>
            <p class="mt-1 text-xl font-semibold text-textColor0 tabular-nums">
              {{ stats.activeDays }}
            </p>
          </div>
          <div class="rounded-2xl bg-surface-ground px-4 py-3">
            <p class="text-xs text-textColor3">{{ $t('ssoLogins.activity.stats.streak') }}</p>
            <p class="mt-1 text-xl font-semibold text-textColor0 tabular-nums">
              {{ $t('ssoLogins.activity.stats.days', { count: stats.streak }) }}
            </p>
          </div>
          <div class="rounded-2xl bg-surface-ground px-4 py-3">
            <p class="text-xs text-textColor3">{{ $t('ssoLogins.activity.stats.busiest') }}</p>
            <p class="mt-1 text-xl font-semibold text-textColor0 tabular-nums">
              {{ stats.busiest ? fmtDate(stats.busiest.date) : '—' }}
            </p>
            <p v-if="stats.busiest" class="text-xs text-textColor3">
              {{ $t('ssoLogins.activity.count', { count: stats.busiest.count }) }}
            </p>
          </div>
        </div>

        <!-- Yo'riqnoma -->
        <div class="mt-5 rounded-2xl border border-surface-line p-4">
          <p class="text-sm font-semibold text-textColor0 mb-3">
            {{ $t('ssoLogins.activity.guide.title') }}
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            <div v-for="g in guide" :key="g.title">
              <p class="text-sm font-medium text-textColor1">{{ g.title }}</p>
              <p class="text-xs leading-5 text-textColor3">{{ g.text }}</p>
            </div>
          </div>
          <p class="text-sm font-medium text-textColor1 mt-4 mb-2">
            {{ $t('ssoLogins.activity.guide.levelsTitle') }}
          </p>
          <div class="flex flex-wrap gap-x-5 gap-y-2">
            <span
              v-for="(c, i) in levelClass"
              :key="c"
              class="flex items-center gap-2 text-xs text-textColor2"
            >
              <span class="w-3.5 h-3.5 rounded-[3px]" :class="c"></span>
              {{ levelLabels[i] }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="tip.show"
        class="activity-tip pointer-events-none fixed z-[3000] rounded-lg border border-surface-line bg-surface-section px-3 py-1.5 text-center shadow-lg"
        :style="{ left: `${tip.x}px`, top: `${tip.y}px` }"
      >
        <p class="text-xs font-semibold text-textColor0 whitespace-nowrap">{{ tip.title }}</p>
        <p class="text-[11px] text-textColor3 whitespace-nowrap">{{ tip.date }}</p>
      </div>
    </Teleport>
  </SectionHeader>
</template>

<style scoped>
  .activity-scroll {
    scrollbar-width: thin;
  }

  .activity-tip {
    transform: translate(-50%, calc(-100% - 8px));
  }
</style>
