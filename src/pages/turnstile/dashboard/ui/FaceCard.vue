<script setup>
  import { Eye20Filled } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import CardHeader from './CardHeader.vue'
  import DeltaBadge from './DeltaBadge.vue'
  import { FaceCardSkeleton } from './skeleton/index.js'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import HeadAiScanIcon from '@/assets/icons/dashboard/head-ai-scan.svg'
  import FaceTurnstileIcon from '@/assets/icons/dashboard/face-turnstile.svg'
  import FaceMobileIcon from '@/assets/icons/dashboard/face-mobile.svg'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const turnstileCount = computed(() => store?.faceIdData?.other || 0)
  const mobileCount = computed(() => store?.faceIdData?.mobile_face || 0)
  const totalCount = computed(() => turnstileCount.value + mobileCount.value)

  const cells = computed(() => [
    {
      previewType: 'ACSEventFaceVerifyPass',
      label: 'turnStileDashboard.cards.turnstileFace',
      count: turnstileCount.value,
      icon: markRaw(FaceTurnstileIcon),
      delta: store.deltas.faceTurnstile
    },
    {
      previewType: 'MobileFaceEvent',
      label: 'turnStileDashboard.cards.mobileFace',
      count: mobileCount.value,
      icon: markRaw(FaceMobileIcon),
      delta: store.deltas.faceMobile
    }
  ])

  const formatCount = (v) => Utils.formatNumberToMoney(v) || '0'
</script>

<template>
  <div class="bg-surface-section rounded-2xl px-1 pb-1 relative overflow-hidden flex flex-col">
    <FaceCardSkeleton v-if="store.dailyAttendanceLoading" />

    <template v-else>
      <CardHeader
        :icon="HeadAiScanIcon"
        tint="teal"
        :title="$t('turnStileDashboard.compare.faceIdTitle')"
        :subtitle="$t('turnStileDashboard.compare.faceIdSubtitle')"
      />

      <div class="flex-1 flex flex-col justify-center gap-2">
        <div class="h-[65px] py-2 flex flex-col items-center justify-center">
          <div class="flex items-center justify-center gap-2.5 flex-wrap">
            <span
              class="font-grotesk font-semibold text-[20px] leading-[24px] text-fig-text-primary"
            >
              {{ formatCount(totalCount) }}
            </span>
            <DeltaBadge
              hide-label
              :delta="store.deltas.faceTotal"
              :loading="store.compareLoading"
            />
          </div>
          <p class="text-[12px] text-fig-text-tertiary text-center">
            {{ $t('turnStileDashboard.cards.allWorkerOfFace') }}
          </p>
        </div>

        <div
          v-for="(cell, idx) in cells"
          :key="idx"
          @click="emits('onPreview', cell.previewType)"
          class="bg-surface-ground-soft rounded-xl px-4 py-1.5 flex flex-1 items-center gap-2 cursor-pointer relative group"
        >
          <div
            class="z-10 transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
          >
            <n-icon size="26">
              <Eye20Filled />
            </n-icon>
          </div>

          <span
            class="w-5 h-5 shrink-0 flex items-center justify-center transition-all duration-300 group-hover:opacity-[0.2]"
          >
            <component :is="cell.icon" />
          </span>
          <div
            class="flex-1 min-w-0 flex flex-col gap-1 justify-center transition-all duration-300 group-hover:opacity-[0.2]"
          >
            <p class="text-[12px] leading-[16px] text-fig-text-secondary truncate">
              {{ $t(cell.label) }}
            </p>
            <div class="flex items-center gap-1 flex-wrap">
              <span
                class="font-grotesk font-semibold text-[20px] leading-[24px] text-fig-text-primary"
              >
                {{ formatCount(cell.count) }}
              </span>
              <DeltaBadge hide-label :delta="cell.delta" :loading="store.compareLoading" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
