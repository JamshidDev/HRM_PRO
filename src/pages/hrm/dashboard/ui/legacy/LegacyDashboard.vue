<script setup>
  /**
   * «Eski» bobi — 6d400d69 («Figma v3 maketiga ko'ra uch bobli dashboard») dan
   * OLDINGI dashboard ko'rinishi. O'sha commit'da `page.vue` ning `general`
   * tarmog'i qanday bo'lsa, shundayligicha ko'chirildi: KPI sarlavha kartalari
   * (`store.dashboard.mainCard`) + `legacyCards` panjarasi + drill-down paneli.
   *
   * Drill-down mexanizmi yangi dashboard bilan UMUMIY (`store.activeDetail`),
   * shuning uchun `Detail/*` komponentlari takrorlanmadi.
   */
  import { UIPageContent } from '@/components/index.js'
  import { useAccountStore, useDashboardStore } from '@/store/modules/index.js'
  import HeaderCard from './HeaderCard.vue'
  import DetailFilters from '../Detail/Filter.vue'
  import { legacyCards } from './constants.js'

  const store = useDashboardStore()
  const accStore = useAccountStore()

  // `n-tabs` animatsiyasi uchun `.n-tabs-pane-wrapper` da `overflow: hidden`
  // turadi. Eski kartalardagi `hover-effect-card` esa hover'da `scale(1.01)`
  // + soya beradi, ya'ni karta o'z katakchasidan bir necha piksel tashqariga
  // chiqadi — chap chekkadagi kartalarning cheti va soyasi shu yerda kesilib
  // qolardi. Yon tomonlarga bo'sh joy beriladi, teskari margin esa panjara
  // joylashuvini o'zgarishsiz qoldiradi (tashqi scroll konteynerida `px-4`,
  // ya'ni 16px bo'sh joy bor, -12px bemalol sig'adi).
  //
  // `flex: 1 1 0` + `min-height: 0`: `n-tabs` — flex ustun, wrapper esa uning
  // elementi. Busiz wrapper balandligi `auto` bo'lib, detal jadvalidagi
  // `h-full` zanjiri uzilardi va pagination konteyner tubiga emas, qatorlardan
  // keyin osilib qolardi. Endi skrollni shu wrapper boshqaradi.
  const paneWrapperStyle = {
    flex: '1 1 0',
    'min-height': '0',
    'overflow-y': 'auto',
    'scrollbar-gutter': 'stable',
    'padding-inline': '12px',
    'margin-inline': '-12px'
  }

  const onDetailEv = (detailComponent, key) => {
    store.resetDetailData()
    if (detailComponent?.detailFactory && key) {
      store.activeDetail = detailComponent.detailFactory(key)
      return
    }
    store.activeDetail = detailComponent
  }
</script>

<template>
  <n-tabs
    class="h-full"
    :value="store.activeDetail ? 1 : 0"
    animated
    :tab-style="{ display: 'none' }"
    :pane-wrapper-style="paneWrapperStyle"
  >
    <n-tab-pane :name="0" class="!p-0">
      <UIPageContent class="!pt-0 !px-0 !m-0">
        <n-spin :show="store.loading" class="min-h-[200px]">
          <!--
            Sof `canView`: `checkAction` yon ta'sirli (toast) va bu yerda har
            render'da ogohlantirish otilardi.
          -->
          <n-grid
            v-if="accStore.canView(accStore.pn.hrDashboard) && !store.loading"
            x-gap="4 m:8 l:12"
            y-gap="4 m:8 l:12"
            cols="12"
            responsive="screen"
          >
            <template v-for="(card, idx) in store.dashboard.mainCard" :key="idx">
              <n-grid-item span="12 l:6 xl:3">
                <HeaderCard :card="card" />
              </n-grid-item>
            </template>
            <n-grid-item v-for="(item, idx) in legacyCards" :key="idx" :span="item.span">
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

    <!-- Detal paneli o'lchangan balandlikni to'liq egallaydi: jadval `h-full` ni
         hisoblay olishi va pagination eng pastda turishi uchun balandlik zanjiri
         uzilmasligi kerak — pane wrapper (`flex: 1`) → `n-tab-pane` (`!h-full`)
         → `UIPageContent` (`!h-full`) → `flex-1 min-h-0`. Kartalar paneliga
         (`:name="0"`) `!h-full` BERILMAYDI: u kontenti bo'yicha o'sib,
         wrapper ichida skroll bo'ladi. -->
    <n-tab-pane :name="1" class="!p-0 !h-full">
      <UIPageContent class="!pt-2 !px-0 !m-0 !h-full">
        <DetailFilters class="shrink-0" />
        <div class="flex-1 min-h-0">
          <component v-if="store.activeDetail?.detail" :is="store.activeDetail?.detail" />
        </div>
      </UIPageContent>
    </n-tab-pane>
  </n-tabs>
</template>
