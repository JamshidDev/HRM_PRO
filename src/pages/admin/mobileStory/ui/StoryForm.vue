<script setup>
  import { Edit16Filled } from '@vicons/fluent'
  import StoryFields from './StoryFields.vue'
  import SlideStrip from './SlideStrip.vue'
  import StoryPreview from './StoryPreview.vue'
  import { useMobileStoryStore } from '@/store/modules/index.js'

  const store = useMobileStoryStore()
  const fieldsRef = ref(null)
  const emits = defineEmits(['save'])

  defineExpose({ submit: () => fieldsRef.value?.submit() })
</script>

<template>
  <n-spin :show="store.detailLoading">
    <div class="flex items-start gap-6">
      <div class="flex-1 min-w-0">
        <!-- Slaydlar -->
        <div class="story-panel-title">
          <n-icon :component="Edit16Filled" :size="16" />
          {{ $t('mobileStoryPage.form.slidesPanel') }}
        </div>
        <div class="mt-4">
          <SlideStrip />
        </div>

        <div class="border-t border-surface-line mt-4 pt-4">
          <StoryFields ref="fieldsRef" @save="emits('save')" />
        </div>
      </div>

      <!-- Live preview — yozilgan matn va tanlangan slaydlar darhol aks etadi.
           Tor ekranda panel yashiriladi, o'rniga slaydga bosib modal preview ochiladi. -->
      <!-- `max-h` modal balandligidan (min(94vh, 940px)) kelib chiqadi: past bo'yli
           ekranda telefon ramkasi panel ichida skroll bo'ladi, aks holda yopishgan
           panelning pastki qismiga yetib bo'lmaydi. -->
      <div
        class="hidden xl:block shrink-0 sticky top-0 max-h-[calc(94vh-160px)] overflow-y-auto"
      >
        <div class="flex items-center gap-2 mb-2">
          <h3 class="text-sm font-semibold text-textColor0">
            {{ $t('mobileStoryPage.form.preview') }}
          </h3>
          <span class="text-xs text-textColor3">
            · {{ $t('mobileStoryPage.form.previewHint') }}
          </span>
        </div>
        <StoryPreview />
      </div>
    </div>
  </n-spin>
</template>

<style scoped>
  /* Maketdagidek ko'k fonli sarlavha qatori. */
  .story-panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 10px;
    background: var(--color-brand-surface);
    color: var(--primary-color);
    font-size: 14px;
    font-weight: 600;
  }

  /* Dark theme'da och-ko'k fon o'rniga to'q kulrang (UIPageFilter bilan bir xil yondashuv). */
  :global([data-theme='dark'] .story-panel-title) {
    background: #344054;
  }
</style>
