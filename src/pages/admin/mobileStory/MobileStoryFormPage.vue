<script setup>
  import { computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { UIPageContent } from '@/components/index.js'
  import { ArrowLeft24Regular, Delete24Regular, Edit16Filled } from '@vicons/fluent'
  import StoryFields from './ui/StoryFields.vue'
  import SlideStrip from './ui/SlideStrip.vue'
  import { useMobileStoryStore } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useMobileStoryStore()
  const route = useRoute()
  const router = useRouter()

  const fieldsRef = ref(null)
  const isCreate = computed(() => route.params.id === 'create')

  const onSaveFields = async () => {
    if (isCreate.value) {
      await store._create() // yaratadi + slaydlarni yuklaydi + /:id ga o'tadi
    } else {
      await store._update()
    }
    window.$Toast?.success(t('mobileStoryPage.saved'))
  }

  const goBack = () => router.push(Utils.routeChatPathMaker(AppPaths.MobileStories))

  const onDeleteStory = async () => {
    await store._deleteStory(store.elementId)
    goBack()
  }

  onMounted(() => {
    if (isCreate.value) store.resetForm()
    else store._show(route.params.id)
  })
</script>

<template>
  <UIPageContent>
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="flex items-center gap-3">
        <n-button quaternary circle @click="goBack">
          <template #icon><n-icon :component="ArrowLeft24Regular" /></template>
        </n-button>
        <h2 class="text-lg font-semibold text-textColor0">
          {{ isCreate ? $t('mobileStoryPage.createTitle') : store.previewTitle || $t('mobileStoryPage.updateTitle') }}
        </h2>
        <n-tag v-if="!isCreate" :type="store.payload.status === 2 ? 'success' : 'default'" size="small" round>
          {{ store.payload.status === 2 ? $t('mobileStoryPage.status.published') : $t('mobileStoryPage.status.draft') }}
        </n-tag>
      </div>

      <n-popconfirm v-if="!isCreate" @positive-click="onDeleteStory">
        <template #trigger>
          <n-button quaternary type="error" size="small" :loading="store.deleteLoading">
            <template #icon><n-icon :component="Delete24Regular" /></template>
            {{ $t('content.delete') }}
          </n-button>
        </template>
        {{ $t('mobileStoryPage.deleteConfirm') }}
      </n-popconfirm>
    </div>

    <n-spin :show="store.detailLoading">
      <div class="max-w-[1000px] flex flex-col gap-4">
        <n-card size="small" :bordered="true" class="story-card">
          <!-- Slaydlar -->
          <div class="story-panel-title">
            <n-icon :component="Edit16Filled" :size="16" />
            {{ $t('mobileStoryPage.form.slidesPanel') }}
          </div>
          <div class="mt-4">
            <SlideStrip />
          </div>

          <div class="border-t border-surface-line mt-4 pt-4">
            <StoryFields ref="fieldsRef" @save="onSaveFields" />
          </div>
        </n-card>

        <div class="flex justify-end">
          <n-button
            type="primary"
            class="min-w-[160px]"
            :loading="store.saveLoading || store.slideUploading"
            @click="fieldsRef?.submit()"
          >
            {{ $t('content.save') }}
          </n-button>
        </div>
      </div>
    </n-spin>
  </UIPageContent>
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
