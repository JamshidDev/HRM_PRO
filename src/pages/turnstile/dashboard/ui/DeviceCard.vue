<script setup>
  import DoublePieceChart from '@/pages/turnstile/dashboard/ui/DoublePieceChart.vue'
  import CardDecor from './CardDecor.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import { Eye20Filled } from '@vicons/fluent'

  const store = useTurnstileDashboardStore()

  const percent = computed(() => {
    if (!store.deviceData) return 0
    return ((store.deviceData?.online / store.deviceData?.all) * 100).toFixed(1)
  })

  const emits = defineEmits(['onPreview'])
</script>

<template>
  <div
    class="p-4 bg-surface-section/75 border border-surface-line rounded-2xl relative overflow-hidden"
  >
    <CardDecor variant="circles" class="-left-8 -bottom-8 rotate-180 text-primary" />
    <n-spin :show="store.devicesLoading">
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-12">
          <h3 class="font-bold text-[17px] leading-[1.2] text-textColor0">
            {{ $t('turnStileDashboard.cards.deviceAnalytic') }}
          </h3>
          <small class="text-xs text-secondary leading-[1.2]">{{
            $t('turnStileDashboard.cards.deviceAnalyticDescription')
          }}</small>
        </div>
        <div class="col-span-5">
          <div class="font-grotesk text-3xl text-textColor0 font-bold leading-[1] mt-5">
            {{ store.deviceData?.all || 0 }}
          </div>
          <small class="text-secondary text-xs leading-[1.2]">{{
            $t('turnStileDashboard.cards.allDevices')
          }}</small>

          <div
            @click="emits('onPreview', 'online_devices')"
            class="bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer p-2 rounded-xl relative group mt-5"
          >
            <div
              class="transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
            >
              <n-icon size="30">
                <Eye20Filled />
              </n-icon>
            </div>
            <div
              class="flex gap-2 items-center opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              <div class="w-[10px] h-[10px] bg-primary rounded-full"></div>
              <small class="text-secondary text-xs">{{
                $t('turnStileDashboard.cards.onlineDevices')
              }}</small>
            </div>
            <h4
              class="font-grotesk text-xl text-textColor0 font-bold opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              {{ store.deviceData?.online || 0 }}
            </h4>
          </div>

          <div
            @click="emits('onPreview', 'offline_devices')"
            class="bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer p-2 rounded-xl relative group mt-1"
          >
            <div
              class="transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
            >
              <n-icon size="30">
                <Eye20Filled />
              </n-icon>
            </div>
            <div
              class="flex gap-2 items-center opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              <div class="w-[10px] h-[10px] bg-primary/30 rounded-full"></div>
              <small class="text-secondary text-xs">{{
                $t('turnStileDashboard.cards.offlineDevices')
              }}</small>
            </div>
            <h4
              class="font-grotesk text-xl text-textColor0 font-bold opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              {{ store.deviceData?.offline || 0 }}
            </h4>
          </div>
        </div>
        <div class="col-span-7 flex justify-end items-center z-10">
          <DoublePieceChart :online="percent" :offline="100 - percent" />
        </div>
      </div>
    </n-spin>
  </div>
</template>
