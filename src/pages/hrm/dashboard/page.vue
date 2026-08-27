<script setup>
  import { UIPageContent, UISegmentTabs } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useDashboardStore } from '@/store/modules/index.js'
  import FigKpiCard from './ui/fig/FigKpiCard.vue'
  import DetailFilters from './ui/Detail/Filter.vue'
  import Filter from './ui/Filter.vue'
  import AuditTab from './ui/audit/AuditTab.vue'
  import AuditDetail from './ui/audit/AuditDetail.vue'
  import AuditDetailFilter from './ui/audit/AuditDetailFilter.vue'
  import DashboardSkeleton from './ui/DashboardSkeleton.vue'

  import { DashboardTab, tabCards } from './constants.js'
  import { buildKpiCards } from './kpi.js'

  const { t } = i18n.global
  const store = useDashboardStore()
  const accStore = useAccountStore()

  // `canView`: bare `hr-dashboard` yoki `hr-dashboard-read`. Skeleton ham shu
  // shart ostida chiziladi — ruxsatsiz foydalanuvchiga hech qachon kelmaydigan
  // kontentning konturi ko'rsatilmasin.
  const canViewDashboard = computed(() => accStore.canView(accStore.pn.hrDashboard))
  const canViewAudit = computed(() => accStore.checkPermission(accStore.pn.hrDashboardAudit))
  const isAudit = computed(() => store.activeTab === DashboardTab.AUDIT && canViewAudit.value)

  // Audit — alohida ko'rish ruxsati; bo'lmasa tab umuman chizilmaydi.
  const tabList = computed(() =>
    [
      { id: DashboardTab.GENERAL, name: t('dashboardPage.tabs.general') },
      { id: DashboardTab.MOVEMENT, name: t('dashboardPage.tabs.movement') },
      { id: DashboardTab.ATTENDANCE, name: t('dashboardPage.tabs.attendance') },
      canViewAudit.value
        ? { id: DashboardTab.AUDIT, name: t('dashboardPage.audit.tabAudit') }
        : null
    ].filter(Boolean)
  )

  // Faol bobning KPI kartalari va kontent kartalari.
  const kpiCards = computed(() => buildKpiCards(store.activeTab, store.tabData(store.activeTab)))
  // Maketda Umumiy va Kadrlar harakati boblarida to'rtta karta bir qatorda,
  // Davomat bobida esa uchtasi kenglikni teng bo'lishadi.
  const kpiSpan = computed(() =>
    kpiCards.value.length === 3 ? '12 m:4' : kpiCards.value.length > 2 ? '12 m:6 xl:3' : '12 m:6'
  )
  const cards = computed(() => tabCards[store.activeTab] || [])

  const onTabSelect = (tab) => {
    store.activeTab = tab
    onTabChange(tab)
  }

  // ── Kontent balandligi ──────────────────────────────────────────────────────
  // Barcha boblar qolgan bo'sh joyni to'liq egallashi kerak: dashboard kartalari
  // sahifa oxirigacha borsin, audit jadvalining pagination footeri esa eng pastda
  // tursin. Yuqoridagi tab/filtr qatorining balandligi o'zgaruvchan (tor ekranda
  // wrap bo'ladi), shuning uchun offset qattiq raqam emas, DOM'dan o'lchanadi.
  const topBarRef = ref(null)
  const contentRef = ref(null)
  const contentHeight = ref(null)

  const measureContentHeight = () => {
    const el = contentRef.value
    if (!el) return
    // `el` ning o'zi scroll konteyneri, shuning uchun uning `top` i o'z scroll
    // pozitsiyasidan o'zgarmaydi — o'lchov barqaror.
    const top = el.getBoundingClientRect().top
    const next = `${Math.max(Math.round(window.innerHeight - top - 4), 320)}px`
    if (next !== contentHeight.value) contentHeight.value = next
  }

  let topBarObserver = null

  onMounted(() => {
    window.addEventListener('resize', measureContentHeight)
    // Filtr qatori wrap bo'lib balandligi o'zgarsa ham qayta o'lchanadi.
    topBarObserver = new ResizeObserver(measureContentHeight)
    if (topBarRef.value) topBarObserver.observe(topBarRef.value)
    nextTick(measureContentHeight)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', measureContentHeight)
    topBarObserver?.disconnect()
  })

  onBeforeMount(() => {
    if (!canViewDashboard.value) return
    store.activeDetail = null
    store.resetAuditDetail()
    store._dashboard()
  })

  const onDetailEv = (detailComponent, key) => {
    store.resetDetailData()
    if (detailComponent?.detailFactory && key) {
      store.activeDetail = detailComponent.detailFactory(key)
      return
    }
    store.activeDetail = detailComponent
  }

  // Tab almashganda ikkala drill-down ham yopiladi va barcha filtrlar tozalanadi.
  const onTabChange = (tab) => {
    store.activeDetail = null
    store.resetAuditDetail()
    // qidiruv/sana/tur va h.k.
    store.resetDetailData()
    // yuqoridagi tashkilot filtri (UISelect `modelV` + `checkedVal` orqali boshqariladi)
    store.params.organizations = []
    store.structureCheck = []
    // Ko'rsatilayotgan ma'lumot tozalangan filtrga mos bo'lishi uchun qayta yuklanadi.
    // Audit tabida `AuditTab` qayta mount bo'lib `_getAuditCounts()` ni o'zi chaqiradi
    // (kontent `v-if` bilan almashadi, ya'ni har safar yangidan mount bo'ladi).
    if (tab !== DashboardTab.AUDIT) store._dashboard()
  }
</script>

<template>
  <div>
    <!-- Tab qatori va filtr bitta satrda: boblar faqat tanlovni boshqaradi,
         kontent ulardan tashqarida, to'liq kenglikda chiziladi. -->
    <div ref="topBarRef" class="flex items-center justify-between gap-3 flex-wrap pl-4 pr-7 py-3">
      <UISegmentTabs
        :tabs="tabList"
        :model-value="store.activeTab"
        @update:model-value="onTabSelect"
      />

      <!-- Barcha boshqaruvlar shu qatorda: audit qidiruvi faqat audit tabida chiqadi. -->
      <div class="flex items-center gap-3 flex-wrap w-full sm:w-auto">
        <AuditDetailFilter v-if="isAudit" />
        <Filter />
      </div>
    </div>

    <div
      ref="contentRef"
      class="px-4"
      style="overflow-y: auto; scrollbar-gutter: stable"
      :style="contentHeight ? { height: contentHeight } : null"
    >
      <!-- Audit bobi — o'z jadvali va pagination'i bilan, o'lchangan konteyner
           balandligini to'liq egallaydi. -->
      <template v-if="store.activeTab === DashboardTab.AUDIT">
        <!-- `!h-full` global `.ui-page-content { height: 100dvh }` ni bosib o'tadi:
             jadval o'lchangan konteyner balandligini to'liq egallaydi va uning
             pagination footeri eng pastda turadi — sahifa scroll qilinmaydi. -->
        <UIPageContent v-if="canViewAudit" class="!pt-0 !px-0 !m-0 !h-full">
          <AuditTab class="shrink-0" />
          <div class="flex-1 min-h-0">
            <AuditDetail />
          </div>
        </UIPageContent>
      </template>

      <!-- Karta drill-down'i. Jadval `h-full` ni hisoblay olishi uchun balandlik
           zanjiri uzilmasligi kerak: `contentRef` (o'lchangan) → `UIPageContent`
           (`!h-full`) → `flex-1 min-h-0`. Shu sababli bu yerda oraliq n-tabs
           ishlatilmaydi — uning pane o'ramida aniq balandlik bo'lmagani uchun
           jadval `min-height` clamp'iga tushib, sahifa oxirigacha yetmasdi. -->
      <template v-else-if="store.activeDetail?.detail">
        <UIPageContent class="!pt-2 !px-0 !m-0 !h-full">
          <DetailFilters class="shrink-0" />
          <div class="flex-1 min-h-0">
            <component :is="store.activeDetail.detail" />
          </div>
        </UIPageContent>
      </template>

      <!-- Bob kartalari. Bu yerda balandlik `auto`: kartalar ro'yxati o'z bo'yicha
           o'sadi, skrollni `contentRef` boshqaradi. -->
      <template v-else>
        <UIPageContent class="!pt-0 !px-0 !m-0 !h-auto">
          <!-- Sof `canView`: `checkAction` yon ta'sirli (toast) va bu yerda
               har render'da ogohlantirish otilardi. Ko'rish ruxsati yo'q
               bo'lsa kartalar butunlay ko'rsatilmaydi. -->
          <template v-if="canViewDashboard">
            <!-- Yuklanishda spinner emas, skeleton: ilgari grid `v-if` bilan
                 butunlay olib tashlanar va ortda bo'sh ekran markazida yolg'iz
                 spinner qolardi. Skeleton ustiga spinner qo'yilmaydi — bitta
                 yuklanish belgisi yetarli. -->
            <DashboardSkeleton v-if="store.loading" />

            <n-grid v-else x-gap="8 m:12 l:16" y-gap="8 m:12 l:16" cols="12" responsive="screen">
              <n-grid-item v-for="card in kpiCards" :key="card.variant" :span="kpiSpan">
                <FigKpiCard
                  :card="card"
                  :variant="card.variant"
                  :mock="store.isMock(store.activeTab, card.mockPath)"
                />
              </n-grid-item>

              <n-grid-item v-for="(item, idx) in cards" :key="idx" :span="item.span">
                <!-- Blur + «Tez orada» endi `FigPanel` ichida: u kartaning o'z
                     `mock` bayrog'iga tayanadi, ya'ni sarlavhadagi "mock" chipi
                     turgan HAR BIR karta yopiladi. Bu yerdagi eski shart faqat
                     `constants.js` dagi `mockKey` li kartalarni qamrardi. -->
                <div class="dash-card-wrap">
                  <component
                    :is="item.component"
                    v-bind="item.props"
                    @detail="(key) => onDetailEv(item, key)"
                  />
                </div>
              </n-grid-item>
            </n-grid>
          </template>
        </UIPageContent>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
  /* Figma v3 kartalarida hover effekti yo'q, ammo bu global uslub boshqa
     sahifalarda (admin/integrationClients, turnstile/events) ishlatiladi —
     shu sababli shu yerda qoldirilgan. */
  .hover-effect-card {
    cursor: pointer;
    transform: scale(1);
    transition: 0.2s ease;

    &:hover {
      transform: scale(1.01);
      z-index: 10;
      box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    }
  }

  /* Karta grid katakchasini to'liq egallashi uchun. Mock kartalardagi
     blur + «Tez orada» qatlami `FigPanel` / `FigKpiCard` ichiga ko'chirilgan
     (uslubi `assets/scss/component.scss` dagi `.fig-soon`). */
  .dash-card-wrap {
    position: relative;
    height: 100%;
  }
</style>
