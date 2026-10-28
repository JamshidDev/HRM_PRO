<script setup>
  import { computed, defineAsyncComponent, watch, onMounted, onBeforeUnmount } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { UIPageContent } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useSalaryControlStore } from '@/store/modules/index.js'
  import { getOneMonthAgoYearMonth } from '@utils'
  import Filter from './ui/Filter.vue'
  import SummaryTab from './ui/SummaryTab.vue'
  import RisksTab from './ui/RisksTab.vue'
  import ErrorState from './ui/ErrorState.vue'
  import EmptyState from './ui/EmptyState.vue'
  import ScSkeleton from './ui/ScSkeleton.vue'
  import ChunkError from './ui/ChunkError.vue'

  const { t } = i18n.global

  // Aktiv tab — YAGONA MANBA `route.query.tab`. n-tabs shunga bog'lanadi; almashtirishda
  // `router.replace` (URL yangilanadi → watch kontentni yuklaydi). Noma'lum → summary.
  const TAB_NAMES = [
    'summary',
    'risks',
    'rules',
    'who',
    'vids',
    'deductions',
    'reports',
    'employees'
  ]

  // Boy bo'limlar lazy-chunk + keep-alive. Chunk yuklanmasa (yangi deploy/tarmoq) —
  // oq ekran emas, ChunkError (qayta yuklash); yuklanishda ScSkeleton.
  const asyncTab = (loader) =>
    defineAsyncComponent({
      loader,
      loadingComponent: ScSkeleton,
      errorComponent: ChunkError,
      delay: 150,
      timeout: 20000
    })
  const Rules = asyncTab(() => import('./ui/Rules.vue'))
  const Who = asyncTab(() => import('./ui/Who.vue'))
  const Vids = asyncTab(() => import('./ui/Vids.vue'))
  const Deductions = asyncTab(() => import('./ui/Deductions.vue'))
  const Reports = asyncTab(() => import('./ui/Reports.vue'))
  const Employees = asyncTab(() => import('./ui/Employees.vue'))

  const TAB_COMPONENTS = {
    summary: SummaryTab,
    risks: RisksTab,
    rules: Rules,
    who: Who,
    vids: Vids,
    deductions: Deductions,
    reports: Reports,
    employees: Employees
  }

  const store = useSalaryControlStore()
  const accStore = useAccountStore()
  const route = useRoute()
  const router = useRouter()

  // Davr standart qiymati (bir oy oldin) — yuklashdan OLDIN o'rnatiladi.
  if (!store.params.year) {
    const ago = getOneMonthAgoYearMonth()
    store.params.year = ago.year
    store.params.month = ago.month
  }

  const activeTab = computed(() => {
    const q = String(route.query.tab || '')
    return TAB_NAMES.includes(q) ? q : 'summary'
  })
  const currentTab = computed(() => TAB_COMPONENTS[activeTab.value] ?? SummaryTab)

  // URL (tab) o'zgarsa — store.mainView sinxron + faqat shu tab ma'lumotini yukla.
  watch(
    activeTab,
    (v) => {
      store.mainView = v
      if (accStore.checkAction(accStore.pn.economistSalaryControlRead)) {
        store._loadForTab(v)
      }
    },
    { immediate: true }
  )

  const onTabChange = (v) => {
    router.replace({ query: { ...route.query, tab: v } }).catch(() => {})
  }

  // Lazy-chunk preload xatosi (yangi deploy, eski hash): bir martalik avtomatik reload
  // (sessionStorage flag bilan cheksiz loop oldini olamiz).
  const CHUNK_FLAG = 'sc-chunk-reloaded'
  const onPreloadError = () => {
    try {
      if (sessionStorage.getItem(CHUNK_FLAG)) return
      sessionStorage.setItem(CHUNK_FLAG, '1')
    } catch {
      /* noop */
    }
    if (typeof $Toast !== 'undefined') $Toast.info(t('salaryControl.common.newVersion'))
    window.location.reload()
  }
  onMounted(() => {
    // Sahifa muvaffaqiyatli yuklandi — keyingi deployда qayta reload mumkin bo'lsin.
    try {
      sessionStorage.removeItem(CHUNK_FLAG)
    } catch {
      /* noop */
    }
    window.addEventListener('vite:preloadError', onPreloadError)
  })
  onBeforeUnmount(() => window.removeEventListener('vite:preloadError', onPreloadError))

  // Faol tab yuklamasi yiqilganmi — ErrorState (qayta urinish).
  const viewError = computed(() => {
    const v = activeTab.value
    if (v === 'summary') return store.summaryError && !store.summaryLoading
    if (v === 'risks')
      return (
        (store.risksError || store.dashboardError) &&
        !store.risksLoading &&
        !store.dashboardLoading
      )
    return store.dashboardError && !store.dashboardLoading
  })

  // Per-xodim boy tablar korxona tanlanishini talab qiladi (backend filtrsiz bo'sh
  // qaytaradi). Shu holatda «Korxona tanlang» ko'rsatamiz.
  const hasOrg = computed(
    () => store.params.organizations.length > 0 || Boolean(store.params.ones_code)
  )
  const ORG_REQUIRED_TABS = [
    'risks',
    'rules',
    'who',
    'vids',
    'deductions',
    'reports',
    'employees'
  ]
  const showOrgPrompt = computed(
    () => !hasOrg.value && ORG_REQUIRED_TABS.includes(activeTab.value)
  )

  const periodLabel = computed(() => {
    const { year, month } = store.params
    if (!year || !month) return ''
    return `${year} · ${String(month).padStart(2, '0')}`
  })
</script>

<template>
  <!-- `!h-auto`: global `.main-content .ui-page-content { height: 100% }` ni bosib o'tadi —
       sahifa kontent bo'yicha o'ssin, skrollni `.main-content` boshqarsin. -->
  <UIPageContent class="!h-auto">
    <div class="mb-3 flex items-end justify-between gap-3">
      <div>
        <h1 class="text-[18px] leading-6 font-semibold text-textColor1">
          {{ $t('salaryControl.title') }}
        </h1>
        <p v-if="periodLabel" class="mt-0.5 text-[12px] leading-4 text-textColor3">
          {{ periodLabel }}
        </p>
      </div>
    </div>

    <n-tabs
      :value="activeTab"
      @update:value="onTabChange"
      type="line"
      animated
      class="mb-2"
    >
      <n-tab-pane name="summary" :tab="$t('salaryControl.tabs.summary')" />
      <n-tab-pane name="risks" :tab="$t('salaryControl.tabs.risks')" />
      <n-tab-pane name="rules" :tab="$t('salaryControl.tabs.rules')" />
      <n-tab-pane name="who" :tab="$t('salaryControl.tabs.who')" />
      <n-tab-pane name="vids" :tab="$t('salaryControl.tabs.vids')" />
      <n-tab-pane name="deductions" :tab="$t('salaryControl.tabs.deductions')" />
      <n-tab-pane name="reports" :tab="$t('salaryControl.tabs.reports')" />
      <n-tab-pane name="employees" :tab="$t('salaryControl.tabs.employees')" />
    </n-tabs>

    <Filter />

    <ErrorState v-if="viewError" @retry="store._retryView(activeTab)" />
    <EmptyState v-else-if="showOrgPrompt" :text="$t('salary1c.selectOrg')" />
    <!-- keep-alive: tab komponentlari bir marta chiziladi va keshlanadi — tez almashish. -->
    <keep-alive v-else>
      <component :is="currentTab" :key="activeTab" />
    </keep-alive>
  </UIPageContent>
</template>

<style scoped></style>
