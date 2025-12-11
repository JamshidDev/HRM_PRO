<script setup>
import DoublePieceChart from "@/pages/turnstile/dashboard/ui/DoublePieceChart.vue"
import {useTurnstileDashboardStore} from "@/store/modules/index.js"

const store = useTurnstileDashboardStore()

const percent = computed(()=>{
  if(!store.deviceData) return 0
  return (store.deviceData?.online/store.deviceData?.all*100).toFixed(1)
})
</script>

<template>
    <div class="px-4 py-2 bg-surface-section border border-surface-line rounded-xl relative cursor-pointer">
      <n-spin :show="store.devicesLoading">
        <div class="grid grid-cols-12">
          <div class="col-span-12">
            <h3 class="font-bold text-lg leading-[1.2] mt-4 text-textColor0" >Qurilmalar analitikasi</h3>
            <small class="text-secondary leading-[1.2]">Ishga kelish va kelmasligi bo'yicha qisqa analitika</small>
          </div>
          <div class="col-span-12">

          </div>
          <div class="col-span-5">
            <div class="text-2xl text-textColor0 font-bold !leading-[0.8] mt-5" >{{store.deviceData?.all || 0}}</div>
            <small class="text-secondary text-xs leading-[1.2]">Barcha qurilmalar</small>

            <div class="flex gap-2 items-center mt-6 content-between">
              <div class="w-[10px] h-[10px] bg-gradient-to-l from-success to-success/60 rounded-xl"></div>
              <small class="text-secondary text-xs">Online qurilmalar soni</small>
            </div>
            <h4 class="text-xl text-textColor0 font-bold">{{store.deviceData?.online || 0}}</h4>

            <div class="flex gap-2 items-center mt-2">
              <div class="w-[10px] h-[10px] bg-gradient-to-l from-danger to-danger/60 rounded-xl"></div>
              <small class="text-secondary text-xs">Ofline qurilmalar soni</small>
            </div>
            <h4 class="text-xl text-textColor0 font-bold">{{store.deviceData?.offline || 0}}</h4>

          </div>
          <div class="col-span-7 flex justify-end z-10">
            <DoublePieceChart  :online="percent" :offline="100-percent"/>
          </div>
        </div>
      </n-spin>

      <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>


    </div>
</template>
