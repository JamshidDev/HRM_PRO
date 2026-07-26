<script setup>
  import { Eye20Filled } from '@vicons/fluent'
  import CardDecor from './CardDecor.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'

  const store = useTurnstileDashboardStore()

  const turnstileCount = computed(() => store?.faceIdData?.other || 0)
  const mobileCount = computed(() => store?.faceIdData?.mobile_face || 0)
  const totalCount = computed(() => turnstileCount.value + mobileCount.value)

  const percentOf = (count) => {
    if (!totalCount.value) return 0
    return Math.min(Math.round((count / totalCount.value) * 100), 100)
  }

  const emits = defineEmits(['onPreview'])
</script>

<template>
  <div
    class="p-4 bg-surface-section/75 border border-surface-line rounded-2xl relative overflow-hidden"
  >
    <CardDecor variant="faceid" class="top-4 right-24 text-primary" />
    <n-spin :show="store.dailyAttendanceLoading">
      <div class="flex flex-col">
        <div>
          <h3 class="font-bold text-[17px] leading-[1.2] text-textColor0">
            {{ $t('turnStileDashboard.cards.turnstileAnalytic') }}
          </h3>
          <small class="text-xs text-secondary leading-[1.2]">{{
            $t('turnStileDashboard.cards.turnstileAnalyticDescription')
          }}</small>
        </div>
        <div class="mt-4">
          <div class="font-grotesk font-bold text-[32px] text-textColor0 leading-[1.2]">
            {{ totalCount }}
          </div>
          <small class="text-xs text-secondary leading-[1.2]">{{
            $t('turnStileDashboard.cards.allWorkerOfFace')
          }}</small>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-4">
          <div
            @click="emits('onPreview', 'ACSEventFaceVerifyPass')"
            class="bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer p-2 rounded-xl relative group"
          >
            <div
              class="transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
            >
              <n-icon size="30">
                <Eye20Filled />
              </n-icon>
            </div>
            <div class="opacity-100 group-hover:opacity-[0.2] transition-all duration-300">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-primary"></span>
                <span class="font-medium text-secondary text-xs">{{
                  $t('turnStileDashboard.cards.turnstileFace')
                }}</span>
              </div>
              <div class="font-grotesk font-bold text-xl text-textColor0 my-2">
                {{ turnstileCount }}
              </div>
              <div class="w-full h-[4px] bg-primary/10 relative rounded-lg overflow-hidden">
                <div
                  class="h-full rounded-lg bg-primary"
                  :style="{ width: percentOf(turnstileCount) + '%' }"
                ></div>
              </div>
            </div>
          </div>
          <div
            @click="emits('onPreview', 'MobileFaceEvent')"
            class="bg-transparent hover:bg-primary/6 transition-all duration-300 cursor-pointer p-2 rounded-xl relative group"
          >
            <div
              class="transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
            >
              <n-icon size="30">
                <Eye20Filled />
              </n-icon>
            </div>
            <div class="opacity-100 group-hover:opacity-[0.2] transition-all duration-300">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-warning"></span>
                <span class="font-medium text-secondary text-xs">{{
                  $t('turnStileDashboard.cards.mobileFace')
                }}</span>
              </div>
              <div class="font-grotesk font-bold text-xl text-textColor0 my-2">
                {{ mobileCount }}
              </div>
              <div class="w-full h-[4px] bg-warning/10 relative rounded-lg overflow-hidden">
                <div
                  class="h-full rounded-lg bg-warning"
                  :style="{ width: percentOf(mobileCount) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-spin>
  </div>
</template>
