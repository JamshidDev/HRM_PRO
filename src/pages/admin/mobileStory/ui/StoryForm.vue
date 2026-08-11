<script setup>
  import { Edit16Filled } from '@vicons/fluent'
  import StoryFields from './StoryFields.vue'
  import SlideStrip from './SlideStrip.vue'
  import { useMobileStoryStore } from '@/store/modules/index.js'

  const store = useMobileStoryStore()
  const fieldsRef = ref(null)
  const emits = defineEmits(['save'])

  defineExpose({ submit: () => fieldsRef.value?.submit() })
</script>

<template>
  <n-spin :show="store.detailLoading">
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
