<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { UIPageContent, NoDataPicture } from '@/components/index.js'
  import { ArrowLeft24Regular, Delete24Regular, Add24Regular, Eye24Regular, ArrowSync24Regular } from '@vicons/fluent'
  import StoryFields from './ui/StoryFields.vue'
  import { useMobileStoryStore } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useMobileStoryStore()
  const route = useRoute()
  const router = useRouter()

  const fileInput = ref(null)
  const replaceInput = ref(null)
  const replaceTargetId = ref(null)
  const isCreate = computed(() => route.params.id === 'create')

  const langKey = () => localStorage.getItem('language') || localStorage.getItem('lang') || 'uz'
  const pick = (obj) => obj?.[langKey()] ?? obj?.uz ?? null

  const onSaveFields = () => {
    if (isCreate.value) store._create()
    else store._update()
  }

  const triggerUpload = () => fileInput.value?.click()
  const onPickFiles = (e) => {
    Array.from(e.target.files ?? []).forEach((f) => store._addSlide(f))
    e.target.value = ''
  }

  const triggerReplace = (slideId) => {
    replaceTargetId.value = slideId
    replaceInput.value?.click()
  }
  const onReplaceFile = (e) => {
    const f = e.target.files?.[0]
    if (f && replaceTargetId.value != null) store._replaceSlide(replaceTargetId.value, f)
    e.target.value = ''
    replaceTargetId.value = null
  }

  const goBack = () => router.push(Utils.routePathMaker(AppPaths.MobileStories))

  onMounted(() => {
    if (isCreate.value) store.resetForm()
    else store._show(route.params.id)
  })
</script>

<template>
  <UIPageContent>
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <div class="flex items-center gap-3">
        <n-button quaternary circle @click="goBack">
          <template #icon><n-icon :component="ArrowLeft24Regular" /></template>
        </n-button>
        <h2 class="text-lg font-semibold text-textColor0">
          {{ isCreate ? $t('mobileStoryPage.createTitle') : (pick(store.payload.title) || $t('mobileStoryPage.updateTitle')) }}
        </h2>
        <n-tag v-if="!isCreate" :type="store.payload.status === 2 ? 'success' : 'default'" size="small" round>
          {{ store.payload.status === 2 ? $t('mobileStoryPage.status.published') : $t('mobileStoryPage.status.draft') }}
        </n-tag>
      </div>
    </div>

    <n-spin :show="store.detailLoading">
      <!-- CREATE: faqat maydon formasi -->
      <div v-if="isCreate" class="max-w-[640px]">
        <n-card :bordered="true" size="small">
          <StoryFields @save="onSaveFields" />
        </n-card>
      </div>

      <!-- EDIT: 2 panel — chap slideshow, o'ng ma'lumot+tahrir (ikkalasi card ichida) -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <!-- CHAP: slaydlar slideshow (card) -->
        <n-card size="small" :bordered="true">
          <div class="flex justify-end mb-3">
            <n-button type="primary" ghost size="small" @click="triggerUpload" :loading="store.slideUploading">
              <template #icon><n-icon :component="Add24Regular" /></template>
              {{ $t('mobileStoryPage.form.addSlide') }}
            </n-button>
          </div>
          <input ref="fileInput" type="file" class="hidden" multiple accept=".png,.jpg,.jpeg,.webp,.mp4,.mov,.webm" @change="onPickFiles" />
          <input ref="replaceInput" type="file" class="hidden" accept=".png,.jpg,.jpeg,.webp,.mp4,.mov,.webm" @change="onReplaceFile" />

          <div v-if="store.slides.length > 0" class="flex justify-center">
            <n-carousel
              :key="store.slides.map((s) => s.id).join('-')"
              effect="card"
              :show-arrow="store.slides.length > 1"
              class="story-carousel"
              draggable
            >
              <div v-for="s in store.slides" :key="s.id" class="story-slide">
                <video v-if="s.media_type === 'video'" :src="s.url" class="story-media" muted playsinline controls />
                <img v-else :src="s.url" class="story-media" alt="" />
                <div class="story-views">
                  <n-icon :component="Eye24Regular" :size="14" />
                  <span>{{ store.viewsCount }}</span>
                </div>
                <div class="story-overlay">
                  <div class="story-text">
                    <h3 v-if="pick(store.payload.title)" class="story-title">{{ pick(store.payload.title) }}</h3>
                    <p v-if="pick(store.payload.subtitle)" class="story-subtitle">{{ pick(store.payload.subtitle) }}</p>
                  </div>
                  <n-button v-if="store.payload.action_type" size="small" type="primary" class="story-action">
                    {{ $t('mobileStoryPage.form.detailsButton') }}
                  </n-button>
                </div>
                <n-button
                  circle
                  size="small"
                  type="primary"
                  class="story-change"
                  :loading="store.slideUploading"
                  @click="triggerReplace(s.id)"
                >
                  <template #icon><n-icon :component="ArrowSync24Regular" /></template>
                </n-button>
                <n-popconfirm @positive-click="store._deleteSlide(s.id)">
                  <template #trigger>
                    <n-button circle size="small" type="error" class="story-del" :loading="store.slideDeletingId === s.id">
                      <template #icon><n-icon :component="Delete24Regular" /></template>
                    </n-button>
                  </template>
                  {{ $t('mobileStoryPage.slideDeleteConfirm') }}
                </n-popconfirm>
              </div>
            </n-carousel>
          </div>
          <div v-else class="text-center py-8 border border-dashed border-surface-line rounded-xl">
            <NoDataPicture />
            <p class="text-textColor3 text-sm mt-2">{{ $t('mobileStoryPage.form.noSlides') }}</p>
          </div>
        </n-card>

        <!-- O'NG: ma'lumot + tahrir (card) -->
        <n-card :title="$t('mobileStoryPage.updateTitle')" size="small" :bordered="true">
          <StoryFields @save="onSaveFields" />
        </n-card>
      </div>
    </n-spin>
  </UIPageContent>
</template>

<style scoped>
  .story-carousel {
    width: 300px;
    height: 530px;
    border-radius: 16px;
    overflow: hidden;
  }
  .story-slide {
    position: relative;
    width: 300px;
    height: 530px;
    background: #000;
  }
  .story-media {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .story-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 18px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 0%, transparent 28%, transparent 62%, rgba(0, 0, 0, 0.55) 100%);
    pointer-events: none;
  }
  .story-title {
    color: #fff;
    font-size: 17px;
    font-weight: 700;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  }
  .story-subtitle {
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    margin-top: 4px;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  }
  .story-action {
    pointer-events: auto;
    align-self: center;
  }
  .story-del {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 5;
  }
  .story-change {
    position: absolute;
    top: 10px;
    right: 52px;
    z-index: 5;
  }
  .story-views {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 9px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    font-size: 12px;
  }
</style>
