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

  import { DashboardTab, tabCards, tabKpiVariants } from './constants.js'

  const { t } = i18n.global
  const store = useDashboardStore()
  const accStore = useAccountStore()

  const canViewAudit = computed(() => accStore.checkPermission(accStore.pn.hrDashboardAudit))
  const isAudit = computed(() => store.activeTab === DashboardTab.AUDIT && canViewAudit.value)

  // Audit — alohida ko'rish ruxsati; bo'lmasa tab umuman chizilmaydi.
  const tabList = computed(() =>
    [
      { id: DashboardTab.GENERAL, name: t('dashboardPage.tabs.general') },
      { id: DashboardTab.MOVEMENT, name: t('dashboardPage.tabs.movement') },
      { id: DashboardTab.ATTENDANCE, name: t('dashboardPage.tabs.attendance') },
      canViewAudit.value ? { id: DashboardTab.AUDIT, name: t('dashboardPage.audit.tabAudit') } : null
    ].filter(Boolean)
  )

  // Faol bobning KPI kartalari va kontent kartalari.
  const kpiCards = computed(() => {
    const variants = tabKpiVariants[store.activeTab] || []
    return store.dashboard.mainCard.filter((card) => variants.includes(card.variant))
  })
  // Maketda Umumiy bobida to'rtta karta bir qatorda, Kadrlar harakatida esa
  // ikkitasi butun kenglikni bo'lishadi.
  const kpiSpan = computed(() => (kpiCards.value.length > 2 ? '12 l:6 xl:3' : '12 l:6'))
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
    // `canView`: bare `hr-dashboard` yoki `hr-dashboard-read` — ikkalasi ham yaraydi.
    if (!accStore.canView(accStore.pn.hrDashboard)) return
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
      <div class="flex items-center gap-3 flex-wrap">
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
      <template v-if="store.activeTab !== DashboardTab.AUDIT">
        <n-tabs
          class="h-full"
          :value="store.activeDetail ? 1 : 0"
          animated
          :tab-style="{ display: 'none' }"
          :pane-wrapper-style="{ 'overflow-y': 'auto', 'scrollbar-gutter': 'stable' }"
        >
          <n-tab-pane :name="0" class="!p-0">
            <UIPageContent class="!pt-0 !px-0 !m-0">
              <n-spin :show="store.loading" class="min-h-[200px]">
                <!-- Sof `canView`: `checkAction` yon ta'sirli (toast) va bu yerda
                     har render'da ogohlantirish otilardi. Ko'rish ruxsati yo'q
                     bo'lsa kartalar butunlay ko'rsatilmaydi. -->
                <n-grid
                  x-gap="8 m:12 l:16"
                  y-gap="8 m:12 l:16"
                  cols="12"
                  v-if="accStore.canView(accStore.pn.hrDashboard) && !store.loading"
                  responsive="screen"
                >
                  <n-grid-item v-for="card in kpiCards" :key="card.variant" :span="kpiSpan">
                    <FigKpiCard :card="card" :variant="card.variant" />
                  </n-grid-item>

                  <n-grid-item v-for="(item, idx) in cards" :key="idx" :span="item.span">
                    <component
                      :is="item.component"
                      v-bind="item.props"
                      @detail="(key) => onDetailEv(item, key)"
                    />
                  </n-grid-item>
                </n-grid>
              </n-spin>
            </UIPageContent>
          </n-tab-pane>
          <n-tab-pane :name="1" class="!p-0">
            <UIPageContent class="!pt-2 !px-0 !m-0">
              <DetailFilters />
              <component v-if="store.activeDetail?.detail" :is="store.activeDetail?.detail" />
            </UIPageContent>
          </n-tab-pane>
        </n-tabs>
      </template>

      <template v-else-if="canViewAudit">
        <!-- `!h-full` global `.ui-page-content { height: 100dvh }` ni bosib o'tadi:
             jadval o'lchangan konteyner balandligini to'liq egallaydi va uning
             pagination footeri eng pastda turadi — sahifa scroll qilinmaydi. -->
        <UIPageContent class="!pt-0 !px-0 !m-0 !h-full">
          <AuditTab class="shrink-0" />
          <div class="flex-1 min-h-0">
            <AuditDetail />
          </div>
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
</style>
