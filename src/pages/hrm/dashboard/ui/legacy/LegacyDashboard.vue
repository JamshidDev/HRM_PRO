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
    :pane-wrapper-style="{ 'overflow-y': 'auto', 'scrollbar-gutter': 'stable' }"
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

    <n-tab-pane :name="1" class="!p-0">
      <UIPageContent class="!pt-2 !px-0 !m-0">
        <DetailFilters />
        <component v-if="store.activeDetail?.detail" :is="store.activeDetail?.detail" />
      </UIPageContent>
    </n-tab-pane>
  </n-tabs>
</template>
