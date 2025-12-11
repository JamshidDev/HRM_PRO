<script setup>
import {ChartMultiple24Regular} from '@vicons/fluent'
import {useTurnstileDashboardStore} from "@/store/modules/index.js"


const store = useTurnstileDashboardStore()

</script>

<template>
  <n-spin :show="store.mainChartLoading">
    <div class="p-2 flex flex-col">
      <div>
        <h3 class="font-bold text-lg leading-[1.2] text-textColor0">Xodimlar analitikasi</h3>
        <small class="text-xs text-secondary leading-[1.2]">Ishga kelish va kelmasligi bo'yicha qisqa analitika</small>
      </div>
      <div class="mt-6">
        <div class="font-bold text-4xl text-textColor0 leading-[1]">{{store?.totalWorkerCount}} <small class="text-xs text-success font-normal">+16 %</small></div>
        <small class="text-xs text-secondary leading-[1.2]">Korxonaining umumiy xodimlarning soni</small>
      </div>

      <div class="flex gap-6 mt-10">
        <div class="flex gap-4 items-center">
          <div>
            <div class="flex items-center gap-2">
              <div class="bg-primary/10 w-[20px] h-[20px] flex justify-center items-center rounded-lg">
                <n-icon size="14" class="text-primary">
                  <ChartMultiple24Regular/>
                </n-icon>
              </div>
              <span class="font-semibold text-secondary text-xs">Kutilgan</span>
            </div>
            <div class="font-bold text-2xl my-2 text-textColor0">{{store.mainChart?.scheduled_workers_today || 0}}</div>
            <div class="w-full h-[4px] bg-primary/10 relative rounded-lg
        before:content-[' '] before:w-[80%] before:h-full before:bg-primary/60 before:absolute before:left-0 before:top-0 overflow-hidden" ></div>
          </div>
        </div>
        <div class="flex gap-4 items-center">
          <div>
            <div class="flex items-center gap-2">
              <div class="bg-warning/10 w-[20px] h-[20px] flex justify-center items-center rounded-lg">
                <n-icon size="14" class="text-warning">
                  <ChartMultiple24Regular/>
                </n-icon>
              </div>
              <span class="font-semibold text-secondary text-xs">Kelgan</span>
            </div>
            <div class="font-bold text-2xl my-2 text-textColor0 ">{{store.mainChart?.attended_workers_today || 0}}</div>
            <div class="w-full h-[4px] bg-warning/10 relative rounded-lg
        before:content-[' '] before:w-[80%] before:h-full before:bg-warning/60 before:absolute before:left-0 before:top-0 overflow-hidden" ></div>
          </div>
        </div>
        <div class="flex gap-4 items-center">
          <div>
            <div class="flex items-center gap-2">
              <div class="bg-danger/10 w-[20px] h-[20px] flex justify-center items-center rounded-lg">
                <n-icon size="14" class="text-danger">
                  <ChartMultiple24Regular/>
                </n-icon>
              </div>
              <span class="font-semibold text-secondary text-xs">Kelmagan</span>
            </div>
            <div class="font-bold text-2xl my-2 text-textColor0">{{store.mainChart?.absent_workers_today || 0}}</div>
            <div class="w-full h-[4px] bg-danger/10 relative rounded-lg
        before:content-[' '] before:w-[80%] before:h-full before:bg-danger/60 before:absolute before:left-0 before:top-0 overflow-hidden" ></div>
          </div>
        </div>
        <!--    <div class="flex gap-4 items-center">-->
        <!--      <CircleChart :percent="12" type="warning"/>-->
        <!--      <div>-->
        <!--        <div class="font-bold text-xl leading-[1.2] text-warning">346</div>-->
        <!--        <div class="leading-[1.2] text-secondary line-clamp-1 text-xs">{{$t('turnStileDashboard.work_durations.workerCountWithSchedule')}}</div>-->
        <!--      </div>-->
        <!--    </div>-->
        <!--    <div class="flex gap-4 items-center">-->
        <!--      <CircleChart :percent="12" type="danger"/>-->
        <!--      <div>-->
        <!--        <div class="font-bold text-xl leading-[1.2] text-danger">346</div>-->
        <!--        <div class="leading-[1.2] text-secondary line-clamp-1 text-xs">{{$t('turnStileDashboard.work_durations.workerCountWithoutSchedule')}}</div>-->
        <!--      </div>-->
        <!--    </div>-->
      </div>
    </div>
  </n-spin>
</template>
