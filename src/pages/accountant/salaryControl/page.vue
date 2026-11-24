<script setup>
  import { computed, defineAsyncComponent, watch, onMounted, onBeforeUnmount } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Beaker24Filled } from '@vicons/fluent'
  import { UIPageContent, UITabs } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useSalaryControlStore } from '@/store/modules/index.js'
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
  // Lazy tab chunk loaderlari — AYNI funksiyalar prefetch uchun ham ishlatiladi
  // (DAS-16729 perf: tab o'tishda chunk allaqachon yuklangan bo'lsin).
  const TAB_LOADERS = {
    rules: () => import('./ui/Rules.vue'),
    who: () => import('./ui/Who.vue'),
    vids: () => import('./ui/Vids.vue'),
    deductions: () => import('./ui/Deductions.vue'),
    reports: () => import('./ui/Reports.vue'),
    employees: () => import('./ui/Employees.vue')
  }

  const TAB_COMPONENTS = {
    summary: SummaryTab,
    risks: RisksTab,
    rules: asyncTab(TAB_LOADERS.rules),
    who: asyncTab(TAB_LOADERS.who),
    vids: asyncTab(TAB_LOADERS.vids),
    deductions: asyncTab(TAB_LOADERS.deductions),
    reports: asyncTab(TAB_LOADERS.reports),
    employees: asyncTab(TAB_LOADERS.employees)
  }

  // Boy tab chunk'larini bo'sh vaqtda (idle) oldindan yuklaymiz — foydalanuvchi tabga
  // o'tganda chunk tayyor (tarmoq kutilmaydi), faqat render qolади. Keep-alive bilan
  // birga tab o'tish sezilarli tezlashadi.
  const prefetchTabs = () => {
    for (const load of Object.values(TAB_LOADERS)) load().catch(() => {})
  }

  const store = useSalaryControlStore()
  const accStore = useAccountStore()
  const route = useRoute()
  const router = useRouter()

  // Davr standart qiymati — ma'lumot bor OXIRGI oy (store._initPeriod, onMounted'da
  // async o'rnatiladi; topilmasa bir oy oldin). Shu bois dastlabki yuklash
  // onMounted'da (davr aniqlangach) boshlanadi — watch immediate EMAS.

  const activeTab = computed(() => {
    const q = String(route.query.tab || '')
    return TAB_NAMES.includes(q) ? q : 'summary'
  })
  const currentTab = computed(() => TAB_COMPONENTS[activeTab.value] ?? SummaryTab)

  // URL (tab) o'zgarsa — store.mainView sinxron + faqat shu tab ma'lumotini yukla.
  // immediate EMAS: dastlabki yuklash onMounted'da (davr aniqlangach) boshlanadi.
  watch(activeTab, (v) => {
    store.mainView = v
    if (accStore.checkAction(accStore.pn.economistSalaryControlRead)) {
      store._loadForTab(v)
    }
  })

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
  onMounted(async () => {
    // Sahifa muvaffaqiyatli yuklandi — keyingi deployда qayta reload mumkin bo'lsin.
    try {
      sessionStorage.removeItem(CHUNK_FLAG)
    } catch {
      /* noop */
    }
    window.addEventListener('vite:preloadError', onPreloadError)

    // Default davrni (ma'lumot bor oxirgi oy) aniqlaymiz, SO'NG aktiv tabni yuklaymiz.
    await store._initPeriod()
    store.mainView = activeTab.value
    if (accStore.checkAction(accStore.pn.economistSalaryControlRead)) {
      store._loadForTab(activeTab.value)
    }
    // Boy tab chunk'larini bo'sh vaqtda oldindan yuklaymiz (tab o'tishni tezlashtiradi).
    const ric = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200))
    ric(prefetchTabs)
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

  // DAS-16735: tanlangan korxonalar (filtr) sahifada ko'rinib tursin — foydalanuvchi
  // ma'lumot qaysi korxonalarga filtrlanganini davr yonida ko'radi.
  const selectedOrgs = computed(() =>
    (store.params.organizations || []).map((o) => o?.name).filter(Boolean)
  )
  const MAX_ORG_CHIPS = 4
  const orgChips = computed(() => selectedOrgs.value.slice(0, MAX_ORG_CHIPS))
  const orgOverflow = computed(() => Math.max(0, selectedOrgs.value.length - MAX_ORG_CHIPS))
</script>

<template>
  <!-- `!h-auto`: global `.main-content .ui-page-content { height: 100% }` ni bosib o'tadi —
       sahifa kontent bo'yicha o'ssin, skrollni `.main-content` boshqarsin. -->
  <UIPageContent class="!h-auto">
    <!-- Test rejimi bayrog'i — modul hali sinovda; ma'lumot/hisob-kitob tekshirilmoqda. -->
    <div class="sc-testmode" role="status">
      <span class="sc-testmode__ic"><n-icon :size="20"><Beaker24Filled /></n-icon></span>
      <div class="sc-testmode__txt">
        <b>{{ $t('salaryControl.testMode.title') }}</b>
        <span>{{ $t('salaryControl.testMode.desc') }}</span>
      </div>
    </div>

    <div class="mb-3 flex items-end justify-between gap-3">
      <div>
        <h1 class="text-[18px] leading-6 font-semibold text-textColor1">
          {{ $t('salaryControl.title') }}
        </h1>
        <p v-if="periodLabel" class="mt-0.5 text-[12px] leading-4 text-textColor3">
          {{ periodLabel }}
        </p>
        <!-- DAS-16735: faol filtr — tanlangan korxona nomlari (davr yonida). -->
        <div v-if="selectedOrgs.length" class="sc-orgchips">
          <span class="sc-orgchips__lbl">{{ $t('content.organization') }}:</span>
          <span v-for="name in orgChips" :key="name" class="sc-orgchip">{{ name }}</span>
          <span v-if="orgOverflow" class="sc-orgchip sc-orgchip--more">+{{ orgOverflow }}</span>
        </div>
      </div>
    </div>

    <UITabs
      :value="activeTab"
      @update:value="onTabChange"
      type="line"
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
    </UITabs>

    <Filter />

    <ErrorState v-if="viewError" @retry="store._retryView(activeTab)" />
    <EmptyState v-else-if="showOrgPrompt" :text="$t('salary1c.selectOrg')" />
    <!-- keep-alive: tab komponentlari bir marta chiziladi va keshlanadi — tez almashish. -->
    <keep-alive v-else>
      <component :is="currentTab" :key="activeTab" />
    </keep-alive>
  </UIPageContent>
</template>

<style scoped>
  /* Test rejimi bayrog'i — sariq (warning) ohang, fig tokenlar (dark/light avto). */
  .sc-testmode {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
    padding: 11px 16px;
    border-radius: 12px;
    background: var(--fig-chip-amber-bg);
    border: 1px solid var(--fig-icon-amber);
  }
  .sc-testmode__ic {
    flex: none;
    display: inline-grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 9px;
    background: var(--fig-icon-amber);
    color: #fff;
  }
  .sc-testmode__txt {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }
  .sc-testmode__txt b {
    font-size: 14px;
    font-weight: 600;
    color: var(--fig-chip-amber-text);
  }
  .sc-testmode__txt span {
    font-size: 12.5px;
    line-height: 1.45;
    color: var(--fig-text-secondary);
  }

  /* Faol filtr — tanlangan korxona chiplar (DAS-16735). */
  .sc-orgchips {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
  }
  .sc-orgchips__lbl {
    font-size: 12px;
    color: var(--fig-text-tertiary);
  }
  .sc-orgchip {
    display: inline-flex;
    align-items: center;
    max-width: 220px;
    padding: 2px 10px;
    border-radius: 999px;
    background: var(--fig-bg-brand-surface);
    border: 0.8px solid var(--fig-blue-300);
    color: var(--fig-text-secondary);
    font-size: 12px;
    line-height: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sc-orgchip--more {
    background: var(--fig-bg-tertiary);
    border-color: var(--fig-br-disable);
    color: var(--fig-text-tertiary);
  }
</style>
