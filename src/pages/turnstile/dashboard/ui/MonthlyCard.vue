<script setup>
import BarChart from "./BarChart.vue"
import {UIUserGroup} from "@/components/index.js"
import {useTurnstileDashboardStore} from "@/store/modules/index.js"

const store = useTurnstileDashboardStore()


</script>

<template>
      <div class="grid grid-cols-12 px-4 py-2 bg-surface-section border border-surface-line rounded-xl cursor-pointer relative">
        <n-spin :show="store.monthlyLoading" class="col-span-12">
          <div class="col-span-12 grid grid-cols-12">
            <div class="col-span-6 mb-4">
              <div class="grid col-span-12">
                <div class="col-span-12">
                  <h3 class="font-bold text-lg leading-[1.2] mt-4 text-textColor0" >{{$t('turnStileDashboard.cards.graphAnalytic')}}</h3>
                  <div class="text-secondary leading-[1.2] text-xs">{{$t('turnStileDashboard.cards.graphAnalyticDescription')}}</div>
                </div>

                <div class="col-span-12 flex flex-col justify-between">


                  <div class="w-full mt-8">
                    <div class="text-2xl font-bold text-textColor0">{{store.monthlyTotalWorkerCount}}</div>
                    <div class="leading-[1.1] text-xs text-secondary mb-2">{{$t('turnStileDashboard.cards.currentMonthWorkerCount')}}</div>
                  </div>
                  <UIUserGroup
                      @click.stop
                      :max="6"
                      :data="store.monthlyTotalWorkerCount<5? store.monthlyWorkers : [...store.monthlyWorkers,...store.monthlyWorkers]"
                      :has-more="store.monthlyTotalWorkerCount-5"
                  />
                </div>
              </div>
            </div>
            <div class="col-span-6 z-10">
              <BarChart/>
            </div>
          </div>

        </n-spin>
        <span
            class=" opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>

      </div>

</template>
