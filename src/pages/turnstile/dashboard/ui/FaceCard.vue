<script setup>
  import { ChartMultiple24Regular, Eye20Filled } from '@vicons/fluent'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'

  const store = useTurnstileDashboardStore()

  const emits = defineEmits(['onPreview'])
</script>

<template>
  <n-spin :show="store.dailyAttendanceLoading">
    <div class="p-2 flex flex-col">
      <div>
        <h3 class="font-bold text-lg leading-[1.2] text-textColor0">
          {{ $t('turnStileDashboard.cards.turnstileAnalytic') }}
        </h3>
        <small class="text-xs text-secondary leading-[1.2]">{{
          $t('turnStileDashboard.cards.turnstileAnalyticDescription')
        }}</small>
      </div>
      <div class="mt-6">
        <div class="font-bold text-4xl text-textColor0 leading-[1]">
          {{ store?.faceIdData?.other + store?.faceIdData?.mobile_face || 0 }}
        </div>
        <small class="text-xs text-secondary leading-[1.2]">{{
          $t('turnStileDashboard.cards.allWorkerOfFace')
        }}</small>
      </div>

      <div class="flex gap-6 mt-4">
        <div class="flex gap-4 items-center">
          <div
            @click="emits('onPreview', 'ACSEventFaceVerifyPass')"
            class="bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer p-2 rounded-xl relative group"
          >
            <div
              class="transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
            >
              <n-icon size="36">
                <Eye20Filled />
              </n-icon>
            </div>
            <div
              class="flex items-center gap-2 opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              <div
                class="bg-primary/10 w-[20px] h-[20px] flex justify-center items-center rounded-lg"
              >
                <n-icon size="14" class="text-primary">
                  <ChartMultiple24Regular />
                </n-icon>
              </div>
              <span class="font-semibold text-secondary text-xs">{{
                $t('turnStileDashboard.cards.turnstileFace')
              }}</span>
            </div>
            <div
              class="font-bold text-2xl my-2 text-textColor0 opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              {{ store?.faceIdData?.other || 0 }}
            </div>
            <div
              class="w-full h-[4px] bg-primary/10 relative rounded-lg before:content-[' '] before:w-[80%] before:h-full before:bg-primary/60 before:absolute before:left-0 before:top-0 overflow-hidden opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            ></div>
          </div>
        </div>
        <div class="flex gap-4 items-center">
          <div
            @click="emits('onPreview', 'MobileFaceEvent')"
            class="bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer p-2 rounded-xl relative group"
          >
            <div
              class="transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
            >
              <n-icon size="36">
                <Eye20Filled />
              </n-icon>
            </div>
            <div
              class="flex items-center gap-2 opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              <div
                class="bg-warning/10 w-[20px] h-[20px] flex justify-center items-center rounded-lg"
              >
                <n-icon size="14" class="text-warning">
                  <ChartMultiple24Regular />
                </n-icon>
              </div>
              <span class="font-semibold text-secondary text-xs">{{
                $t('turnStileDashboard.cards.mobileFace')
              }}</span>
            </div>
            <div
              class="font-bold text-2xl my-2 text-textColor0 opacity-100 group-hover:opacity-[0.2] transition-all duration-300"
            >
              {{ store?.faceIdData?.mobile_face || 0 }}
            </div>
            <div
              class="opacity-100 group-hover:opacity-[0.2] transition-all duration-300 w-full h-[4px] bg-warning/10 relative rounded-lg before:content-[' '] before:w-[80%] before:h-full before:bg-warning/60 before:absolute before:left-0 before:top-0 overflow-hidden"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <span
      class="opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"
    ></span>
  </n-spin>
</template>
