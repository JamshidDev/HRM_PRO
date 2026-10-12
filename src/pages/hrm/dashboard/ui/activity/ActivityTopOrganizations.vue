<script setup>
  // «Top korxonalar» — 7 / 30 kun yoki butun davr reytingi; barcha o'rinlar bitta jadvalda.
  import { UISegmentTabs } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import HeadUsers from '@/assets/icons/hrmDashboard/activity/head-users.svg?url'
  import ChevronRight from '@/assets/icons/hrmDashboard/activity/chevron-right.svg?url'
  import ApiService from '@/service/ApiService.js'
  import { useDashboardStore } from '@/store/modules/index.js'
  import { NIcon } from 'naive-ui'
  import { Building20Regular, Search20Regular } from '@vicons/fluent'
  import { naiveIcons } from '@/assets/theme/theme.js'
  import { actionTypes, formatCount } from './utils.js'

  const { t } = i18n.global

  const emit = defineEmits(['view'])

  const store = useDashboardStore()

  const period = ref('7')
  const periodTabs = computed(() => [
    { id: '7', name: t('dashboardPage.orgRating.period7') },
    { id: '30', name: t('dashboardPage.orgRating.period30') },
    { id: 'all', name: t('dashboardPage.orgRating.periodAll') }
  ])

  const TOP_LIMIT = 10
  // Default — top-10; «Barchasini ko'rish» to'liq ro'yxatni ochadi.
  const expanded = ref(false)

  const loading = ref(false)
  const organizations = ref([])
  // Oxirgi so'rov javobi eski javobni bosib ketmasin.
  let requestId = 0

  const load = () => {
    const id = ++requestId
    loading.value = true
    const params = store.appendParams({ period: period.value })
    ApiService.dashboardService
      ._activityOrganizations({ params })
      .then((res) => {
        if (id === requestId) organizations.value = res.data.data?.items || []
      })
      .finally(() => {
        if (id === requestId) loading.value = false
      })
  }
  watch([period, () => store.params.organizations], load, { immediate: true, deep: true })
  watch(period, () => (expanded.value = false))

  const search = ref('')

  // O'rin backend'dan keladi (qidiruvdan oldingi umumiy o'rin).
  const ranked = computed(() => organizations.value)

  const query = computed(() => search.value.trim().toLowerCase())

  const tableRows = computed(() => {
    if (query.value) {
      return ranked.value.filter((o) => (o.name || '').toLowerCase().includes(query.value))
    }
    return expanded.value ? ranked.value : ranked.value.slice(0, TOP_LIMIT)
  })

  const shownCount = computed(() => tableRows.value.length)

  // Sanoq ustunlari — qiymat badge ichida; 0 bo'lsa kulrang.
  const countColumns = [
    {
      key: 'total',
      label: 'dashboardPage.activity.actions',
      badge: 'bg-fig-blue-100 text-fig-text-brand'
    },
    {
      key: 'commands',
      label: 'dashboardPage.activity.commandsCreated',
      badge: 'bg-[#f6dafc] text-[#9e2fb8]'
    },
    {
      key: 'approved_documents',
      label: 'dashboardPage.activity.approvedDocuments',
      badge: 'bg-fig-green-100 text-[#067647]'
    },
    {
      key: 'applications',
      label: 'dashboardPage.activity.applications',
      badge: 'bg-fig-amber-100 text-[#b54708]'
    }
  ]

  // «Taqsimot» ustunidagi chiziq — maketda 146px, turlar ulushiga ko'ra bo'linadi.
  const DIST_WIDTH = 146
  const segWidth = (row, key) =>
    row[key] ? `${Math.max(2, Math.round((row[key] / row.total) * DIST_WIDTH))}px` : '0px'

  const showAll = () => {
    search.value = ''
    expanded.value = true
  }
</script>

<template>
  <div class="flex flex-col gap-4 rounded-2xl bg-fig-block shadow-card p-4">
    <!-- Sarlavha + qidiruv + rejim -->
    <div class="flex w-full flex-wrap items-center justify-between gap-2">
      <div class="flex min-w-0 flex-1 items-center gap-2.5">
        <span class="flex shrink-0 items-center rounded-full bg-fig-blue-100 p-1.5">
          <img :src="HeadUsers" alt="" width="20" height="20" class="block" />
        </span>
        <p class="truncate text-[14px] leading-[18px] font-semibold text-fig-text-primary">
          {{ $t('dashboardPage.activity.topOrganizations') }}
        </p>
      </div>

      <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <!-- Qidiruv: balandligi yonidagi davr segmenti bilan bir xil (36px). Fokusda
             chegara brend rangga o'tadi va atrofida yumshoq halqa paydo bo'ladi. -->
        <label class="activity-search group/search">
          <n-icon
            :component="Search20Regular"
            :size="18"
            class="shrink-0 text-fig-text-tertiary transition-colors group-focus-within/search:text-fig-text-brand"
          />
          <input
            v-model="search"
            type="text"
            class="min-w-0 flex-1 bg-transparent text-[14px] leading-5 text-fig-text-primary outline-none placeholder:text-fig-text-tertiary"
            :placeholder="$t('dashboardPage.activity.searchOrganization')"
            @keydown.esc="search = ''"
          />
          <button
            v-if="search"
            type="button"
            class="ui-clear-btn -mr-1"
            :aria-label="$t('content.clear')"
            @click="search = ''"
          >
            <component :is="naiveIcons.clear" />
          </button>
        </label>
        <UISegmentTabs v-model="period" :tabs="periodTabs" />
      </div>
    </div>

    <n-spin :show="loading" class="activity-top-body">
      <!-- Jadval -->
      <div class="w-full overflow-x-auto rounded-[20px] bg-fig-block p-1">
        <div class="min-w-[1080px]">
          <div
            class="flex w-full items-center overflow-hidden rounded-t-2xl bg-fig-bg-disable text-[14px] leading-5 whitespace-nowrap text-fig-text-secondary"
          >
            <div class="flex h-[52px] w-10 shrink-0 items-center justify-center px-2">
              {{ $t('dashboardPage.activity.no') }}
            </div>
            <div class="flex h-[52px] w-[320px] shrink-0 items-center px-2">
              {{ $t('dashboardPage.activity.organization') }}
            </div>
            <div
              v-for="col in countColumns"
              :key="col.key"
              class="flex h-[52px] w-[112px] shrink-0 items-center justify-center px-2 whitespace-nowrap"
            >
              {{ $t(col.label) }}
            </div>
            <div class="flex h-[52px] min-w-0 flex-1 items-center px-2">
              {{ $t('dashboardPage.activity.distribution') }}
            </div>
            <div class="flex h-[52px] w-[88px] shrink-0 items-center justify-center px-2">
              {{ $t('dashboardPage.activity.score') }}
            </div>
          </div>

          <div
            v-for="row in tableRows"
            :key="row.id"
            class="activity-row group flex w-full cursor-pointer items-center border-b border-fig-bg-disable transition-colors hover:bg-fig-bg-secondary"
            @click="emit('view', row)"
          >
            <div class="flex h-14 w-10 shrink-0 items-center justify-center">
              <span class="text-[14px] leading-5 text-fig-text-secondary">{{ row.rank }}</span>
            </div>
            <div class="flex w-[320px] shrink-0 items-center gap-2.5 px-2">
              <span
                class="flex size-9 shrink-0 items-center justify-center rounded-full bg-fig-blue-100"
              >
                <n-icon :component="Building20Regular" :size="18" class="text-fig-text-brand" />
              </span>
              <div class="flex min-w-0 flex-col gap-px whitespace-nowrap">
                <p
                  class="truncate text-[13.5px] leading-5 font-semibold text-fig-text-primary group-hover:text-fig-text-brand"
                  :title="row.name"
                >
                  {{ row.name }}
                </p>
                <p class="truncate text-[12px] leading-4 text-fig-text-tertiary">
                  {{ $t('dashboardPage.activity.workersCount', { n: formatCount(row.workers) }) }}
                </p>
              </div>
            </div>
            <div
              v-for="col in countColumns"
              :key="col.key"
              class="flex h-14 w-[112px] shrink-0 items-center justify-center px-2"
            >
              <span
                class="inline-flex min-w-9 items-center justify-center rounded-full px-2.5 py-0.5 text-[13px] leading-[18px] font-semibold"
                :class="row[col.key] ? col.badge : 'bg-fig-bg-disable text-fig-text-tertiary'"
              >
                {{ formatCount(row[col.key]) }}
              </span>
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
            <div class="flex h-14 w-[88px] shrink-0 items-center justify-center px-2">
              <span
                class="inline-flex min-w-10 items-center justify-center rounded-lg px-2.5 py-1 text-[14px] leading-[18px] font-bold"
                :class="
                  row.score
                    ? 'bg-fig-bg-brand text-white'
                    : 'bg-fig-bg-disable text-fig-text-tertiary'
                "
              >
                {{ formatCount(row.score) }}
              </span>
            </div>
          </div>

          <p v-if="!tableRows.length" class="py-8 text-center text-[14px] text-fig-text-tertiary">
            {{ loading ? '' : $t('dashboardPage.activity.empty') }}
          </p>
        </div>
      </div>
    </n-spin>

    <!-- Footer -->
    <div class="flex w-full items-center justify-between gap-2">
      <p class="text-[12px] leading-4 whitespace-nowrap text-fig-text-tertiary">
        {{ $t('dashboardPage.activity.shown', { shown: shownCount, total: ranked.length }) }}
      </p>
      <button
        v-if="(!expanded || query) && ranked.length > TOP_LIMIT"
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
  .activity-top-body :deep(.n-spin-content) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .activity-search {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    height: 36px;
    padding: 0 12px;
    border: 1px solid var(--fig-br-secondary);
    border-radius: 10px;
    background: var(--fig-block-bg);
    cursor: text;
    transition:
      border-color 0.16s ease,
      box-shadow 0.16s ease;
  }

  @media (min-width: 640px) {
    .activity-search {
      width: 280px;
    }
  }

  .activity-search:hover {
    border-color: var(--fig-text-disable);
  }

  .activity-search:focus-within {
    border-color: var(--fig-bg-brand-fill);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--fig-bg-brand-fill) 16%, transparent);
  }
</style>
