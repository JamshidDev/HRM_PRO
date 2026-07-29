<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { UIPageContent, UIDrawer, NoDataPicture } from '@/components/index.js'
  import { ArrowLeft24Regular, Delete24Regular, Add24Regular, Edit24Regular } from '@vicons/fluent'
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
  const fieldsDrawer = ref(false)

  const isCreate = computed(() => route.params.id === 'create')
  const lang = () => localStorage.getItem('lang') || 'uz'
  const pick = (obj) => obj?.[lang()] ?? obj?.uz ?? null

  const onSaveFields = async () => {
    if (isCreate.value) {
      await store._create() // yaratadi + /:id ga o'tadi
    } else {
      await store._update()
      fieldsDrawer.value = false
    }
  }

  const triggerUpload = () => fileInput.value?.click()
  const onPickFiles = (e) => {
    Array.from(e.target.files ?? []).forEach((f) => store._addSlide(f))
    e.target.value = ''
  }

  const onDeleteStory = async () => {
    await store._deleteStory(store.elementId)
    goBack()
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
      <div v-if="!isCreate" class="flex items-center gap-2">
        <n-button type="primary" ghost @click="triggerUpload" :loading="store.slideUploading">
          <template #icon><n-icon :component="Add24Regular" /></template>
          {{ $t('mobileStoryPage.form.addSlide') }}
        </n-button>
        <n-button ghost @click="fieldsDrawer = true">
          <template #icon><n-icon :component="Edit24Regular" /></template>
          {{ $t('mobileStoryPage.form.editFields') }}
        </n-button>
        <n-popconfirm @positive-click="onDeleteStory">
          <template #trigger>
            <n-button type="error" ghost :loading="store.deleteLoading">
              <template #icon><n-icon :component="Delete24Regular" /></template>
            </n-button>
          </template>
          {{ $t('mobileStoryPage.deleteConfirm') }}
        </n-popconfirm>
      </div>
    </div>

    <n-spin :show="store.detailLoading">
      <!-- CREATE: faqat maydon formasi -->
      <div v-if="isCreate" class="max-w-[640px]">
        <StoryFields @save="onSaveFields" />
      </div>

      <!-- EDIT: slaydlar slideshow -->
      <div v-else>
        <input ref="fileInput" type="file" class="hidden" multiple accept=".png,.jpg,.jpeg,.webp,.mp4,.mov,.webm" @change="onPickFiles" />

        <div v-if="store.slides.length > 0" class="flex justify-center">
          <n-carousel :show-arrow="store.slides.length > 1" class="story-carousel" draggable>
            <div v-for="s in store.slides" :key="s.id" class="story-slide">
              <video v-if="s.media_type === 'video'" :src="s.url" class="story-media" muted playsinline controls />
              <img v-else :src="s.url" class="story-media" alt="" />

              <!-- mobil ko'rinish overlay: title/subtitle/action -->
              <div class="story-overlay">
                <div class="story-text">
                  <h3 v-if="pick(store.payload.title)" class="story-title">{{ pick(store.payload.title) }}</h3>
                  <p v-if="pick(store.payload.subtitle)" class="story-subtitle">{{ pick(store.payload.subtitle) }}</p>
                </div>
                <n-button v-if="store.payload.action_type" size="small" type="primary" class="story-action">
                  {{ store.payload.action_type }}
                </n-button>
              </div>

              <!-- slayd o'chirish -->
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

        <div v-else class="text-center py-8">
          <NoDataPicture />
          <p class="text-textColor3 text-sm mt-2">{{ $t('mobileStoryPage.form.noSlides') }}</p>
        </div>
      </div>
    </n-spin>

    <!-- Maydonlarni tahrirlash (drawer) -->
    <UIDrawer
      :visible="fieldsDrawer"
      @update:visible="(v) => (fieldsDrawer = v)"
      :title="$t('mobileStoryPage.form.editFields')"
    >
      <template #content>
        <StoryFields @save="onSaveFields" />
      </template>
    </UIDrawer>
  </UIPageContent>
</template>

<style scoped>
  .story-carousel {
    width: 320px;
    height: 560px;
    border-radius: 16px;
    overflow: hidden;
  }
  .story-slide {
    position: relative;
    width: 320px;
    height: 560px;
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
    padding: 20px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 0%, transparent 30%, transparent 60%, rgba(0, 0, 0, 0.55) 100%);
    pointer-events: none;
  }
  .story-title {
    color: #fff;
    font-size: 18px;
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
</style>
