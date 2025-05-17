<script setup>
import {UIPageContent} from "@/components/index.js"
import {useAccountStore, useDashboardStore} from "@/store/modules/index.js"
import HeaderCard from "@/pages/hrm/dashboardV3/ui/HeaderCard.vue";
import DetailFilters from "./ui/Detail/Filter.vue"
import Filter from './ui/Filter.vue'

import {cards} from './constants.js'

const store = useDashboardStore()
const accStore = useAccountStore()


onBeforeMount(() => {
  if (!accStore.checkAction(accStore.pn.hrDashboardRead)) return
  store.activeDetail=null
  store._index()
})


const onDetailEv = (detailComponent) => {
  store.resetDetailData()
  store.activeDetail = detailComponent
}

</script>

<template>
  <div class="overflow-y-auto max-h-[100%]" style="scrollbar-gutter: stable;">
    <div class="flex justify-between items-center px-4 py-3">
      <n-breadcrumb>
        <n-breadcrumb-item @click="store.activeDetail=null">Dashboard</n-breadcrumb-item>
        <n-breadcrumb-item v-if="store.activeDetail">
          {{$t(store.activeDetail.title)}}
        </n-breadcrumb-item>
      </n-breadcrumb>
      <Filter />
    </div>
    <n-tabs :value="store.activeDetail ? 1 : 0" animated :tab-style="{'display': 'none'}">
      <n-tab-pane :name="0" class="!p-0">
        <UIPageContent class="!pt-0 !px-4 !m-0">
          <n-spin :show="store.loading" class="min-h-[200px]">
            <n-grid x-gap="4 m:8 l:12" y-gap="4 m:8 l:12" cols="12" v-if="accStore.checkAction(accStore.pn.hrDashboardRead) && !store.loading" responsive="screen">

              <template v-for="(card, idx) in store.dashboard.mainCard" :key="idx">
                <n-grid-item span="12 l:6 xl:3">
                  <HeaderCard :card="card"/>
                </n-grid-item>
              </template>
              <n-grid-item v-for="(item, idx) in cards" :key="idx" :span="item.span">
                <component v-if="item?.detail"  :key="idx"  :is="item.component" @detail="onDetailEv(item)" />
                <component v-else  :is="item.component" />
              </n-grid-item>

            </n-grid>
          </n-spin>

        </UIPageContent>
      </n-tab-pane>
      <n-tab-pane :name="1" class="!p-0">
        <UIPageContent class="!pt-2 !px-4 !m-0">
          <DetailFilters />
          <component v-if="store.activeDetail?.detail" :is="store.activeDetail.detail"/>
        </UIPageContent>
      </n-tab-pane>

    </n-tabs>
  </div>

</template>

<style lang="scss">

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
