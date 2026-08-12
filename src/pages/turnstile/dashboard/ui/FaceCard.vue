<script setup>
  import { Eye20Filled, ScanObject20Filled, Phone20Filled, Board20Filled } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import CardHeader from './CardHeader.vue'
  import DeltaBadge from './DeltaBadge.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'

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
      icon: markRaw(Board20Filled),
      chip: 'text-primary bg-primary/10',
      delta: store.deltas.faceTurnstile
    },
    {
      previewType: 'MobileFaceEvent',
      label: 'turnStileDashboard.cards.mobileFace',
      count: mobileCount.value,
      icon: markRaw(Phone20Filled),
      chip: 'text-success bg-success/10',
      delta: store.deltas.faceMobile
    }
  ])

  const formatCount = (v) => Utils.formatNumberToMoney(v) || '0'
</script>

<template>
  <div
    class="stretch-card p-4 bg-surface-section/75 border border-surface-line rounded-2xl relative overflow-hidden flex flex-col"
  >
    <n-spin :show="store.dailyAttendanceLoading" class="flex-1 flex flex-col">
      <CardHeader
        :icon="ScanObject20Filled"
        type="success"
        :title="$t('turnStileDashboard.compare.faceIdTitle')"
        :subtitle="$t('turnStileDashboard.compare.faceIdSubtitle')"
      />

      <div class="text-center mt-auto pt-6">
        <div class="flex items-center justify-center gap-2 flex-wrap">
          <span class="font-grotesk font-bold text-textColor0 text-[30px] leading-[1.1]">
            {{ formatCount(totalCount) }}
          </span>
          <DeltaBadge hide-label :delta="store.deltas.faceTotal" :loading="store.compareLoading" />
        </div>
        <div class="text-xs text-secondary leading-[1.3] mt-1">
          {{ $t('turnStileDashboard.cards.allWorkerOfFace') }}
        </div>
      </div>

      <div class="flex flex-col gap-2 mt-6">
        <div
          v-for="(cell, idx) in cells"
          :key="idx"
          @click="emits('onPreview', cell.previewType)"
          class="relative group cursor-pointer border border-surface-line rounded-xl p-3 hover:bg-primary/6 transition-all duration-300"
        >
          <div
            class="z-10 transition-all duration-500 scale-0 absolute left-1/2 top-1/2 -translate-1/2 text-primary opacity-0 group-hover:opacity-100 group-hover:scale-100"
          >
            <n-icon size="26">
              <Eye20Filled />
            </n-icon>
          </div>

          <div
            class="flex items-center gap-3 transition-all duration-300 group-hover:opacity-[0.2]"
          >
            <div
              class="w-[36px] h-[36px] shrink-0 rounded-[10px] flex justify-center items-center"
              :class="cell.chip"
            >
              <n-icon size="20">
                <component :is="cell.icon" />
              </n-icon>
            </div>
            <div class="min-w-0">
              <div class="text-xs text-secondary leading-[1.3] line-clamp-1">
                {{ $t(cell.label) }}
              </div>
              <div class="flex items-center gap-2 flex-wrap mt-1">
                <span class="font-grotesk font-bold text-textColor0 text-[18px] leading-[1.1]">
                  {{ formatCount(cell.count) }}
                </span>
                <DeltaBadge hide-label :delta="cell.delta" :loading="store.compareLoading" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-spin>
  </div>
</template>

<style scoped>
  /* n-spin ichki `.n-spin-content` ni ham cho'zamiz — aks holda karta qo'shni
     baland karta bo'yiga tenglashganda kontent tepada qolib, pastda bo'sh joy qoladi. */
  .stretch-card :deep(.n-spin-container),
  .stretch-card :deep(.n-spin-content) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
</style>
