<script setup>
import {PersonClock20Regular, ClockToolbox20Regular} from '@vicons/fluent'
import WorkTimeChart from "@/pages/turnstile/dashboard/ui/WorkTimeChart.vue"
import {useTurnstileDashboardStore} from "@/store/modules/index.js"
const store = useTurnstileDashboardStore()

const lateComeCount = computed(()=> store.workTime? store.workTime?.late_and_early?.late[4]?.count : 0)
const earlyGoCount = computed(()=> store.workTime? store.workTime?.late_and_early?.early[4]?.count : 0)

</script>

<template>
    <div class="grid grid-cols-12 px-4 py-2 bg-surface-section border border-surface-line rounded-xl relative cursor-pointer min-h-[315px]">
      <n-spin :show="store.workTimeLoading" class="col-span-12">
        <div class="grid grid-cols-12">
          <div class="col-span-12">
            <h3 class="font-bold text-lg leading-[1.2] mt-4 text-textColor0" >{{$t('turnStileDashboard.cards.workTimeTitle')}}</h3>
            <small class="text-secondary leading-[1.2]">{{$t('turnStileDashboard.cards.workTimeSubtitle')}}</small>
          </div>
          <div class="col-span-5">
            <div class="text-2xl text-textColor0 font-bold !leading-[0.8] mt-5" >{{store.totalWorkerCount}}</div>
            <small class="text-secondary text-xs leading-[1.2]">{{$t('turnStileDashboard.cards.allWorkers')}}</small>

            <!--      <div class="flex gap-2 items-center mt-4">-->
            <!--        <div class="w-[32px] h-[32px] bg-gradient-to-l from-primary to-primary/70 rounded-lg"></div>-->
            <!--        <div class="leading-1">-->
            <!--          <div class="text-lg text-textColor0 font-bold leading-[1.2]">369</div>-->
            <!--          <small class="text-secondary text-xs leading-[1.2]">Vaqtida kelgan</small>-->
            <!--        </div>-->
            <!--      </div>-->

            <div class="flex gap-2 items-center mt-4">
              <div class="w-[32px] h-[32px] bg-warning/10 rounded-lg flex">
                <n-icon size="24" class="text-warning m-auto">
                  <ClockToolbox20Regular/>
                </n-icon>
              </div>
              <div class="leading-1">
                <h4 class="text-lg text-textColor0 font-bold leading-[1.2]">{{earlyGoCount}}</h4>
                <small class="text-secondary text-xs leading-[1.2]">{{$t('turnStileDashboard.cards.earlyCome')}}</small>
              </div>
            </div>

            <div class="flex gap-2 items-center mt-4">
              <div class="w-[32px] h-[32px] bg-danger/10 rounded-lg flex">
                <n-icon size="24" class="text-danger m-auto">
                  <PersonClock20Regular/>
                </n-icon>
              </div>
              <div class="leading-1">
                <h4 class="text-lg text-textColor0 font-bold leading-[1.2]">{{lateComeCount}}</h4>
                <small class="text-secondary text-xs leading-[1.2]">{{$t('turnStileDashboard.cards.lateCome')}}</small>
              </div>
            </div>





          </div>
          <div class="col-span-7 flex justify-end z-10">
            <!--      <DoublePieceChart  :online="90" :offline="10"/>-->
            <WorkTimeChart class="z-10" />
          </div>
        </div>
      </n-spin>



      <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>


    </div>

</template>
