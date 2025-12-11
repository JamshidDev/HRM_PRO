<script setup>
import CircleChart from "./CircleChart.vue"
import {useTurnstileDashboardStore} from "@/store/modules/index.js"
import {ChartMultiple24Regular} from "@vicons/fluent"

const store = useTurnstileDashboardStore()

const grandPercent = ref(0)
const notPassedPercent = ref(0)
const vacationPercent = ref(0)
const casualPercent = ref(0)


watchEffect(() => {
  if(store.grandWorkerData && store.totalWorkerCount){
    grandPercent.value = Number(store.grandWorkerData.privilege_turnstile_workers_count/store.totalWorkerCount*100).toFixed(1)
    notPassedPercent.value = Number(store.grandWorkerData.not_passed_turnstile_workers_count/store.totalWorkerCount*100).toFixed(1)
    vacationPercent.value = Number(store.grandWorkerData.vacation_workers?.total/store.totalWorkerCount*100).toFixed(1)
    casualPercent.value = Number(store.grandWorkerData.casual_workers/store.totalWorkerCount*100).toFixed(1)
  }
})
</script>

<template>

    <div class="grid grid-cols-12 px-4 py-2 bg-surface-section border border-surface-line rounded-xl relative cursor-pointer">
      <n-spin :show="store.grandLoading" class="col-span-12">
        <div class="grid grid-cols-12">

          <div class="col-span-12 my-4">
            <h3 class="font-bold text-lg leading-[1.2] text-textColor0" >Imtiyozli xodimlar</h3>
            <small class="text-secondary leading-[1.2]">Ishga kelish va kelmasligi bo'yicha qisqa analitika</small>
          </div>
          <div class="col-span-12 flex flex-wrap gap-x-6 gap-y-2 justify-center content-end mb-2">

            <div class="flex flex-col w-[70px]">
              <h3 class="text-lg font-bold flex gap-1 items-center text-textColor0">
          <span class="bg-success/10 w-[20px] h-[20px] flex justify-center items-center rounded-lg">
            <n-icon size="14" class="text-success">
              <ChartMultiple24Regular/>
            </n-icon>
          </span>
                {{store.grandWorkerData?.privilege_turnstile_workers_count || 0}}</h3>
              <h3 class="text-[10px] font-normal text-secondary pl-1 mt-3 mb-1 line-clamp-1">Imtiyozli</h3>
              <CircleChart :percent="grandPercent" type="success"/>
            </div>

            <div class="flex flex-col w-[70px]">
              <h3 class="text-lg font-bold flex gap-1 items-center text-textColor0">
          <span class="bg-warning/10 w-[20px] h-[20px] flex justify-center items-center rounded-lg">
            <n-icon size="14" class="text-warning">
              <ChartMultiple24Regular/>
            </n-icon>
          </span>
                {{store.grandWorkerData?.not_passed_turnstile_workers_count || 0}}</h3>
              <h3 class="text-[10px]  font-normal text-secondary pl-1 mt-3 mb-1 line-clamp-1">O'tmaydigan</h3>
              <CircleChart :percent="notPassedPercent" type="warning"/>
            </div>

            <div class="flex flex-col w-[70px]">
              <h3 class="text-lg font-bold flex gap-1 items-center text-textColor0">
          <span class="bg-dark/10 w-[20px] h-[20px] flex justify-center items-center rounded-lg">
            <n-icon size="14" class="text-dark">
              <ChartMultiple24Regular/>
            </n-icon>
          </span>
                {{store.grandWorkerData?.vacation_workers?.total || 0}}</h3>
              <h3 class="text-[10px]  font-normal text-secondary pl-1 mt-3 mb-1 line-clamp-1">Ta'tilda</h3>
              <CircleChart :percent="vacationPercent" type="dark"/>
            </div>

            <div class="flex flex-col w-[70px]">
              <h3 class="text-lg font-bold flex gap-1 items-center text-textColor0">
          <span class="bg-primary/10 w-[20px] h-[20px] flex justify-center items-center rounded-lg">
            <n-icon size="14" class="text-primary">
              <ChartMultiple24Regular/>
            </n-icon>
          </span>
                {{store.grandWorkerData?.casual_workers || 0}}</h3>
              <h3 class="text-[10px]  font-normal text-secondary pl-1 mt-3 mb-1 line-clamp-1">Dam kuni</h3>
              <CircleChart :percent="casualPercent" type="primary"/>
            </div>
          </div>
        </div>






      </n-spin>
      <span class=" opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>
    </div>


</template>
