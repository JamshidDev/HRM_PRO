<script setup>
import {UIPageContent} from "@/components/index.js"
import ContractChart from "./ui/ContractChart.vue"
import AgeChart from "./ui/AgeChart.vue"
import EduChart from "./ui/EduChart.vue"

import {useAccountStore, useDashboardStore} from "@/store/modules/index.js"
import InfoCard from "@/pages/hrm/dashboardV3/ui/InfoCard.vue"
import YearlyChart from "@/pages/hrm/dashboardV3/ui/YearlyChart.vue"
import BirthdayCard from "@/pages/hrm/dashboardV3/ui/BirthdayCard.vue"
import VacationChart from "@/pages/hrm/dashboardV3/ui/VacationChart.vue"
import IncentiveChart from "@/pages/hrm/dashboardV3/ui/IncentiveChart.vue";
import HeaderCard from "@/pages/hrm/dashboardV3/ui/HeaderCard.vue";

import BirthdayDetail from "./ui/Detail/BirthdayDetail.vue"

const store = useDashboardStore()
const accStore = useAccountStore()


onBeforeMount(() => {
  if (!accStore.checkAction(accStore.pn.hrDashboardRead)) return
  store._index()
})


const cards = ref([
  {
    component: markRaw(AgeChart),
    span: "12 l:6 xl:4"
  },
  {
    component: markRaw(EduChart),
    span: "12 l:6 xl:4"
  },
  {
    component: markRaw(IncentiveChart),
    span: "12 l:6 xl:4"
  },
  {
    component: markRaw(YearlyChart),
    span: "12 l:6 xl:8"
  },
  {
    component: markRaw(BirthdayCard),
    span: "12 l:6 xl:4",
    title: 'dashboardPage.birthday.title',
    // detail: markRaw(BirthdayDetail)
  },
  {
    component: markRaw(VacationChart),
    span: "12 l:6 xl:4"
  },
  {
    component: markRaw(ContractChart),
    span: "12 l:6 xl:4"
  },
  {
    component: markRaw(InfoCard),
    span: "12 l:6 xl:4"
  },
])

const currentDetail = ref(null)


</script>

<template>
  <div>
    <n-breadcrumb class="px-6 py-2">
      <n-breadcrumb-item @click="currentDetail=null">Dashboard</n-breadcrumb-item>
      <n-breadcrumb-item v-if="currentDetail">
        {{$t(currentDetail.title)}}
      </n-breadcrumb-item>
    </n-breadcrumb>
    <n-tabs :value="currentDetail ? 1 : 0" animated :tab-style="{'display': 'none'}">
      <n-tab-pane :name="0" class="!p-0">
        <UIPageContent class="!pt-0 !mt-0">
          <n-spin :show="store.loading">
            <n-grid x-gap="4 m:8 l:12" y-gap="4 m:8 l:12" cols="12" v-if="accStore.checkAction(accStore.pn.hrDashboardRead) && !store.loading" responsive="screen">

              <template v-for="(card, idx) in store.dashboard.mainCard" :key="idx">
                <n-grid-item span="12 l:6 xl:3">
                  <HeaderCard :card="card"/>
                </n-grid-item>
              </template>
              <n-grid-item v-for="(item, idx) in cards" :key="idx" :span="item.span">
                <component v-if="item?.detail"  :key="idx"  :is="item.component" @detail="currentDetail = item" />
                <component v-else  :is="item.component" />
              </n-grid-item>

            </n-grid>
          </n-spin>

        </UIPageContent>
      </n-tab-pane>
      <n-tab-pane :name="1">
        <UIPageContent class="!pt-0 !mt-0">
          <component v-if="currentDetail?.detail" :is="currentDetail.detail"/>
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
