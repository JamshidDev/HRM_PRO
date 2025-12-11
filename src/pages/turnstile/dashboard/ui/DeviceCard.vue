<script setup>
import DoublePieceChart from "@/pages/turnstile/dashboard/ui/DoublePieceChart.vue"
import {useTurnstileDashboardStore} from "@/store/modules/index.js"
import {Eye20Filled} from "@vicons/fluent"

const store = useTurnstileDashboardStore()

const percent = computed(()=>{
  if(!store.deviceData) return 0
  return (store.deviceData?.online/store.deviceData?.all*100).toFixed(1)
})

const emits = defineEmits(['onPreview'])
</script>

<template>
    <div class="px-4 py-2 bg-surface-section border border-surface-line rounded-xl relative cursor-pointer">
      <n-spin :show="store.devicesLoading">
        <div class="grid grid-cols-12">
          <div class="col-span-12">
            <h3 class="font-bold text-lg leading-[1.2] mt-4 text-textColor0" >Qurilmalar analitikasi</h3>
            <small class="text-secondary leading-[1.2]">Ishga kelish va kelmasligi bo'yicha qisqa analitika</small>
          </div>
          <div class="col-span-5">
            <div class="text-2xl text-textColor0 font-bold !leading-[0.8] mt-5" >{{store.deviceData?.all || 0}}</div>
            <small class="text-secondary text-xs leading-[1.2]">Barcha qurilmalar</small>

            <div @click="emits('onPreview', 'come')" class="bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer p-2 rounded-xl relative group mt-6">
              <div class="transition-all duration-500 scale-0   absolute left-1/2 top-1/2 -translate-1/2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100">
                <n-icon size="36">
                  <Eye20Filled/>
                </n-icon>
              </div>
              <div class="flex gap-2 items-center content-between opacity-100 group-hover:opacity-[0.2] transition-all duration-300">
                <div class="w-[10px] h-[10px] bg-gradient-to-l from-success to-success/60 rounded-xl"></div>
                <small class="text-secondary text-xs">Online qurilmalar soni</small>
              </div>
              <h4 class="text-xl text-textColor0 font-bold opacity-100 group-hover:opacity-[0.2] transition-all duration-300">{{store.deviceData?.online || 0}}</h4>
            </div>


            <div @click="emits('onPreview', 'come')" class="bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer p-2 rounded-xl relative group mt-2">
              <div class="transition-all duration-500 scale-0   absolute left-1/2 top-1/2 -translate-1/2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100">
                <n-icon size="36">
                  <Eye20Filled/>
                </n-icon>
              </div>
              <div class="flex gap-2 items-center opacity-100 group-hover:opacity-[0.2] transition-all duration-300">
                <div class="w-[10px] h-[10px] bg-gradient-to-l from-danger to-danger/60 rounded-xl"></div>
                <small class="text-secondary text-xs">Ofline qurilmalar soni</small>
              </div>
              <h4 class="text-xl text-textColor0 font-bold opacity-100 group-hover:opacity-[0.2] transition-all duration-300">{{store.deviceData?.offline || 0}}</h4>
            </div>


          </div>
          <div class="col-span-7 flex justify-end z-10">
            <DoublePieceChart  :online="percent" :offline="100-percent"/>
          </div>
        </div>
      </n-spin>

      <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>


    </div>
</template>
