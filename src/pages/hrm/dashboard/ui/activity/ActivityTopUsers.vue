<script setup>
  /**
   * «Top foydalanuvchilar» — birinchi uch o'rin shohsupada, qolganlari jadvalda
   * (Figma node 3869:61914).
   *
   * «Top 10» rejimida jadvalda 4–10-o'rinlar, «Barchasi» rejimida qolgan
   * hammasi chiqadi. Qidiruv paytida shohsupa yashiriladi va jadval barcha
   * mos kelganlarni o'z umumiy o'rni bilan ko'rsatadi.
   */
  import { UISegmentTabs } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import HeadUsers from '@/assets/icons/hrmDashboard/activity/head-users.svg?url'
  import SearchIcon from '@/assets/icons/hrmDashboard/activity/search.svg?url'
  import EyeIcon from '@/assets/icons/hrmDashboard/activity/eye.svg?url'
  import ChevronRight from '@/assets/icons/hrmDashboard/activity/chevron-right.svg?url'
  import RibbonLeft from '@/assets/icons/hrmDashboard/activity/ribbon-left.svg?url'
  import RibbonRight1 from '@/assets/icons/hrmDashboard/activity/ribbon-right-1.svg?url'
  import RibbonRight2 from '@/assets/icons/hrmDashboard/activity/ribbon-right-2.svg?url'
  import RibbonRight3 from '@/assets/icons/hrmDashboard/activity/ribbon-right-3.svg?url'
  import Medal1 from '@/assets/icons/hrmDashboard/activity/medal-1.svg?url'
  import Medal2 from '@/assets/icons/hrmDashboard/activity/medal-2.svg?url'
  import Medal3 from '@/assets/icons/hrmDashboard/activity/medal-3.svg?url'
  import { actionTypes } from './mock.js'
  import { formatCount, formatLastActivity, totalOf } from './utils.js'

  const { t } = i18n.global

  const props = defineProps({
    users: { type: Array, default: () => [] },
    // Tizimdagi jami mas'ullar soni (footerdagi maxraj)
    total: { type: Number, default: 0 }
  })

  const emit = defineEmits(['view'])

  const Mode = { TOP: 'top', ALL: 'all' }
  const mode = ref(Mode.TOP)
  const search = ref('')

  const modeTabs = computed(() => [
    { id: Mode.TOP, name: t('dashboardPage.activity.top10') },
    { id: Mode.ALL, name: t('dashboardPage.activity.all') }
  ])

  // Umumiy o'rin qidiruvdan oldin, jami amal bo'yicha belgilanadi.
  const ranked = computed(() =>
    props.users
      .map((u) => ({ ...u, total: totalOf(u) }))
      .sort((a, b) => b.total - a.total)
      .map((u, idx) => ({ ...u, rank: idx + 1, fullName: `${u.last_name} ${u.first_name}` }))
  )

  const query = computed(() => search.value.trim().toLowerCase())

  const leaders = computed(() => (query.value ? [] : ranked.value.slice(0, 3)))

  const tableRows = computed(() => {
    if (query.value) {
      return ranked.value.filter((u) =>
        `${u.fullName} ${u.department} ${u.position}`.toLowerCase().includes(query.value)
      )
    }
    const rest = ranked.value.slice(3)
    return mode.value === Mode.TOP ? rest.slice(0, 7) : rest
  })

  const shownCount = computed(() => leaders.value.length + tableRows.value.length)

  // Shohsupa tartibi: 2 — 1 — 3. Har o'rin uchun chegara, medal va lenta rangi.
  const PODIUM = {
    1: {
      medal: Medal1,
      ribbon: RibbonRight1,
      border: 'border-[#f5d06b] md:rounded-b-none md:border-b-0'
    },
    2: { medal: Medal2, ribbon: RibbonRight2, border: 'border-[#98a2b3]' },
    3: { medal: Medal3, ribbon: RibbonRight3, border: 'border-[#f7b27a]' }
  }
  const podium = computed(() => {
    const [first, second, third] = leaders.value
    return [second, first, third].filter(Boolean)
  })

  // «Taqsimot» ustunidagi chiziq — maketda 146px, turlar ulushiga ko'ra bo'linadi.
  const DIST_WIDTH = 146
  const segWidth = (user, key) =>
    `${Math.max(2, Math.round(((user[key] || 0) / (user.total || 1)) * DIST_WIDTH))}px`

  const showAll = () => {
    search.value = ''
    mode.value = Mode.ALL
  }
</script>

<template>
  <div class="flex flex-col gap-4 rounded-2xl bg-fig-block p-4">
    <!-- Sarlavha + qidiruv + rejim -->
    <div class="flex w-full flex-wrap items-center justify-between gap-2">
      <div class="flex min-w-0 flex-1 items-center gap-2.5">
        <span class="flex shrink-0 items-center rounded-full bg-fig-blue-100 p-1.5">
          <img :src="HeadUsers" alt="" width="20" height="20" class="block" />
        </span>
        <p class="truncate text-[14px] leading-[18px] font-semibold text-fig-text-primary">
          {{ $t('dashboardPage.activity.topUsers') }}
        </p>
      </div>

      <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <label
          class="flex h-9 w-full cursor-text items-center gap-2 rounded-lg bg-fig-bg-secondary px-4 sm:w-[264px]"
        >
          <img :src="SearchIcon" alt="" width="18" height="18" class="block shrink-0" />
          <input
            v-model="search"
            type="text"
            class="min-w-0 flex-1 bg-transparent text-[14px] leading-5 text-fig-text-primary outline-none placeholder:text-fig-text-tertiary"
            :placeholder="$t('dashboardPage.activity.search')"
          />
        </label>
        <UISegmentTabs v-model="mode" :tabs="modeTabs" variant="surface" class="activity-mode" />
      </div>
    </div>

    <!-- Shohsupa -->
    <div v-if="podium.length" class="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
      <div
        v-for="leader in podium"
        :key="leader.id"
        class="flex flex-col"
        :class="
          leader.rank === 1 ? 'order-first md:order-none md:self-stretch' : 'md:self-start md:pt-6'
        "
      >
        <div
          class="flex w-full flex-col gap-4 rounded-xl border bg-fig-bg-secondary p-3"
          :class="PODIUM[leader.rank].border"
        >
          <div class="flex w-full items-center gap-3">
            <span class="size-11 shrink-0 overflow-hidden rounded-full bg-fig-block">
              <img :src="leader.photo" alt="" class="size-full object-cover object-top" />
            </span>
            <div class="flex min-w-0 flex-1 flex-col gap-0.5">
              <p class="truncate text-[14px] leading-[18px] font-medium text-fig-text-primary">
                {{ leader.fullName }}
              </p>
              <div class="flex items-baseline gap-1 whitespace-nowrap">
                <span class="text-[20px] leading-[26px] font-semibold text-fig-text-primary">
                  {{ formatCount(leader.total) }}
                </span>
                <span class="text-[12px] leading-4 text-fig-text-tertiary">
                  {{ $t('dashboardPage.activity.unit') }}
                </span>
              </div>
            </div>
            <!-- Medal: ikki lenta + doira + o'rin raqami (30×39) -->
            <div class="relative h-[39px] w-[30px] shrink-0">
              <div class="absolute top-[16.5px] left-[5.25px] h-[22.5px] w-[10.5px]">
                <img
                  :src="RibbonLeft"
                  alt=""
                  class="absolute block max-w-none"
                  style="inset: -3.18% -5.26% -6% -6.65%"
                />
              </div>
              <div class="absolute top-[16.5px] left-[14.25px] h-[22.5px] w-[10.5px]">
                <img
                  :src="PODIUM[leader.rank].ribbon"
                  alt=""
                  class="absolute block max-w-none"
                  style="inset: -3.18% -6.65% -6% -5.26%"
                />
              </div>
              <img
                :src="PODIUM[leader.rank].medal"
                alt=""
                width="30"
                height="30"
                class="absolute top-0 left-0 block"
              />
              <span
                class="absolute top-0 left-0 flex size-[30px] items-center justify-center text-[13.5px] font-extrabold text-white"
              >
                {{ leader.rank }}
              </span>
            </div>
          </div>

          <div class="flex w-full border-t border-fig-bg-disable">
            <div
              v-for="(type, idx) in actionTypes"
              :key="type.key"
              class="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden px-2.5 py-3"
              :class="idx < actionTypes.length - 1 && 'border-r border-fig-br-disable'"
            >
              <div class="flex items-center gap-1.5">
                <span class="size-[7px] shrink-0 rounded-full" :class="type.color"></span>
                <span class="text-[14px] leading-[18px] font-semibold text-fig-text-primary">
                  {{ formatCount(leader[type.key]) }}
                </span>
              </div>
              <span class="truncate text-[12px] leading-4 text-fig-text-tertiary">
                {{ $t(type.label) }}
              </span>
            </div>
          </div>
        </div>
        <!-- 1-o'rin ostidagi «pog'ona» -->
        <div
          v-if="leader.rank === 1"
          class="activity-step hidden min-h-6 w-full flex-1 rounded-b-xl md:block"
        ></div>
      </div>
    </div>

    <!-- Jadval -->
    <div class="w-full overflow-x-auto rounded-[20px] bg-fig-block p-1">
      <div class="min-w-[880px]">
        <div
          class="flex w-full items-center overflow-hidden rounded-t-2xl bg-fig-bg-disable text-[14px] leading-5 whitespace-nowrap text-fig-text-secondary"
        >
          <div class="flex h-[52px] w-10 shrink-0 items-center justify-center px-2">
            {{ $t('dashboardPage.activity.no') }}
          </div>
          <div class="flex h-[52px] w-[300px] shrink-0 items-center px-2">
            {{ $t('dashboardPage.activity.worker') }}
          </div>
          <div class="flex h-[52px] min-w-0 flex-1 items-center px-2">
            {{ $t('dashboardPage.activity.department') }}
          </div>
          <div class="flex h-[52px] w-[120px] shrink-0 items-center px-2">
            {{ $t('dashboardPage.activity.actions') }}
          </div>
          <div class="flex h-[52px] min-w-0 flex-1 items-center px-2">
            {{ $t('dashboardPage.activity.distribution') }}
          </div>
          <div class="flex h-[52px] min-w-0 flex-1 items-center px-2">
            {{ $t('dashboardPage.activity.lastActivity') }}
          </div>
          <div class="h-[52px] w-14 shrink-0"></div>
        </div>

        <div
          v-for="row in tableRows"
          :key="row.id"
          class="activity-row group flex w-full items-center border-b border-fig-bg-disable transition-colors hover:bg-fig-bg-secondary"
        >
          <div class="flex h-14 w-10 shrink-0 items-center justify-center">
            <span class="text-[14px] leading-5 text-fig-text-secondary">{{ row.rank }}</span>
          </div>
          <div class="flex w-[300px] shrink-0 items-center gap-2.5 px-2">
            <span class="size-9 shrink-0 overflow-hidden rounded-full bg-fig-block">
              <img :src="row.photo" alt="" class="size-full object-cover object-top" />
            </span>
            <div class="flex min-w-0 flex-col gap-px whitespace-nowrap">
              <p
                class="truncate text-[13.5px] leading-5 font-semibold text-fig-text-primary group-hover:text-fig-text-brand"
              >
                {{ row.fullName }}
              </p>
              <p class="truncate text-[12px] leading-4 text-fig-text-tertiary">
                {{ row.position }}
              </p>
            </div>
          </div>
          <div class="flex h-14 min-w-0 flex-1 items-center px-2">
            <p class="truncate text-[14px] leading-5 text-fig-text-secondary">
              {{ row.department }}
            </p>
          </div>
          <div class="flex h-14 w-[120px] shrink-0 items-center px-2">
            <p class="text-[14px] leading-[18px] font-semibold text-fig-text-primary">
              {{ formatCount(row.total) }}
            </p>
          </div>
          <div class="flex h-14 min-w-0 flex-1 items-center px-2">
            <div class="flex items-start gap-0.5">
              <span
                v-for="type in actionTypes"
                :key="type.key"
                class="block h-1.5 shrink-0 rounded-[3px]"
                :class="type.color"
                :style="{ width: segWidth(row, type.key) }"
              ></span>
            </div>
          </div>
          <div class="flex h-14 min-w-0 flex-1 items-center px-2">
            <p class="truncate text-[14px] leading-5 text-fig-text-secondary">
              {{ formatLastActivity(row.last_activity) }}
            </p>
          </div>
          <div class="flex size-14 shrink-0 items-center justify-center px-2">
            <button
              type="button"
              class="flex cursor-pointer items-center justify-center transition-opacity hover:opacity-70"
              @click="emit('view', row)"
            >
              <img :src="EyeIcon" alt="" width="24" height="24" class="block" />
            </button>
          </div>
        </div>

        <p
          v-if="!tableRows.length && !podium.length"
          class="py-8 text-center text-[14px] text-fig-text-tertiary"
        >
          {{ $t('dashboardPage.activity.empty') }}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex w-full items-center justify-between gap-2">
      <p class="text-[12px] leading-4 whitespace-nowrap text-fig-text-tertiary">
        {{
          $t('dashboardPage.activity.shown', { shown: shownCount, total: total || ranked.length })
        }}
      </p>
      <button
        v-if="mode !== Mode.ALL || query"
        type="button"
        class="flex cursor-pointer items-center gap-1 transition-opacity hover:opacity-80"
        @click="showAll"
      >
        <span class="text-[12px] leading-4 font-semibold whitespace-nowrap text-fig-text-brand">
          {{ $t('dashboardPage.activity.viewAll') }}
        </span>
        <img :src="ChevronRight" alt="" width="16" height="16" class="block" />
      </button>
    </div>
  </div>
</template>

<style scoped>
  .activity-step {
    background: linear-gradient(to bottom, #fec84b, rgba(254, 200, 75, 0.13));
  }

  /* Maketdagi «Top 10 / Barchasi» toggle — 12px matn, 12px gorizontal padding. */
  .activity-mode :deep(.seg-tabs__item) {
    padding: 8px 12px;
    font-size: 12px;
    line-height: 16px;
  }
</style>
