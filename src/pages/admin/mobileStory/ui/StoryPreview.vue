<script setup>
  import { useMobileStoryStore } from '@/store/modules/index.js'
  import { UIPhoneFrame } from '@/components/index.js'
  import {
    ArrowSync24Regular,
    ChevronLeft24Filled,
    ChevronRight24Filled,
    Eye24Regular,
    ImageAdd24Regular
  } from '@vicons/fluent'

  const store = useMobileStoryStore()

  const props = defineProps({
    startIndex: { type: Number, default: 0 }
  })

  const activeIndex = ref(props.startIndex)
  const replaceInput = ref(null)
  const replaceTargetId = ref(null)

  const slides = computed(() => store.displaySlides)
  const activeSlide = computed(() => slides.value[activeIndex.value] ?? null)

  // Slayd o'chirilsa/almashtirilsa indeks chegarada qoladi.
  watch(
    () => slides.value.length,
    (len) => {
      if (activeIndex.value > len - 1) activeIndex.value = Math.max(len - 1, 0)
    }
  )

  const go = (index) => {
    if (index >= 0 && index < slides.value.length) activeIndex.value = index
  }
  const prev = () => go(activeIndex.value - 1)
  const next = () => go(activeIndex.value + 1)

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
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <input
      ref="replaceInput"
      type="file"
      class="hidden"
      accept=".png,.jpg,.jpeg,.webp,.mp4,.mov,.webm"
      @change="onReplaceFile"
    />

    <!-- Telefon ramkasi -->
    <!-- `.story-overlay` yuqorisida allaqachon qoraytiruvchi gradient bor,
         shuning uchun ramkaning o'z scrim'i o'chirilgan. -->
    <UIPhoneFrame
      class="group"
      :status-bar-scrim="false"
      fluid-height="min(695px, calc(94vh - 250px))"
    >
      <div class="story-screen">
        <video
          v-if="activeSlide?.media_type === 'video'"
          :key="activeSlide.id"
          :src="activeSlide.url"
          class="story-media"
          muted
          playsinline
          controls
        />
        <img v-else-if="activeSlide" :src="activeSlide.url" class="story-media" alt="" />

        <!-- Slayd tanlanmagan holat (panel formani ochgan zahoti ko'rinadi) -->
        <div v-else class="story-empty">
          <n-icon :component="ImageAdd24Regular" :size="30" />
          <span>{{ $t('mobileStoryPage.form.noSlides') }}</span>
        </div>

        <!-- Progress segmentlari -->
        <div class="story-bars">
          <span
            v-for="(s, i) in slides"
            :key="s.id"
            class="story-bar"
            :class="i === activeIndex ? 'bg-white' : 'bg-white/35'"
            @click="go(i)"
          />
        </div>

        <!-- Ko'rishlar -->
        <div class="story-head">
          <n-tooltip trigger="hover">
            <template #trigger>
              <span class="story-views">
                <n-icon :component="Eye24Regular" :size="14" />
                {{ store.viewsCount }}
              </span>
            </template>
            {{ $t('mobileStoryPage.table.views') }}
          </n-tooltip>
        </div>

        <!-- Matn + action -->
        <div class="story-overlay">
          <div class="story-text">
            <h3 v-if="store.previewTitle" class="story-title">{{ store.previewTitle }}</h3>
            <p v-if="store.previewSubtitle" class="story-subtitle">{{ store.previewSubtitle }}</p>
          </div>
          <n-button v-if="store.payload.action_type" size="small" type="primary" class="story-action">
            {{ $t('mobileStoryPage.form.detailsButton') }}
          </n-button>
        </div>

        <!-- Almashtirish (yuklangan slayd uchun) -->
        <n-tooltip v-if="activeSlide && !activeSlide.pending" trigger="hover">
          <template #trigger>
            <n-button
              circle
              size="small"
              type="primary"
              class="story-replace"
              :loading="store.slideUploading"
              @click="triggerReplace(activeSlide.id)"
            >
              <template #icon><n-icon :component="ArrowSync24Regular" /></template>
            </n-button>
          </template>
          {{ $t('mobileStoryPage.form.replaceSlide') }}
        </n-tooltip>

        <!-- Navigatsiya -->
        <template v-if="slides.length > 1">
          <button v-if="activeIndex > 0" class="story-nav left-2" @click="prev">
            <n-icon :component="ChevronLeft24Filled" :size="18" />
          </button>
          <button v-if="activeIndex < slides.length - 1" class="story-nav right-2" @click="next">
            <n-icon :component="ChevronRight24Filled" :size="18" />
          </button>
        </template>
      </div>
    </UIPhoneFrame>

    <p v-if="slides.length > 1" class="text-xs text-textColor3">
      {{ activeIndex + 1 }} / {{ slides.length }}
    </p>
  </div>
</template>

<style scoped>
  .story-screen {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .story-media {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .story-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 100%;
    padding: 0 28px;
    color: rgba(255, 255, 255, 0.45);
    font-size: 12px;
    text-align: center;
  }
  /* Yuqoridagi elementlar status bar va dynamic island ostidan boshlanadi. */
  .story-bars {
    position: absolute;
    top: 42px;
    left: 12px;
    right: 12px;
    z-index: 6;
    display: flex;
    gap: 4px;
  }
  .story-bar {
    flex: 1;
    height: 3px;
    border-radius: 999px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .story-head {
    position: absolute;
    top: 54px;
    left: 12px;
    z-index: 6;
  }
  .story-views {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 9px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    font-size: 12px;
    backdrop-filter: blur(4px);
  }
  .story-overlay {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 14px;
    padding: 18px;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.35) 0%,
      transparent 22%,
      transparent 55%,
      rgba(0, 0, 0, 0.65) 100%
    );
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
  .story-replace {
    position: absolute;
    top: 52px;
    right: 12px;
    z-index: 6;
  }
  .story-nav {
    position: absolute;
    top: 50%;
    z-index: 6;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    transform: translateY(-50%);
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
    opacity: 0;
    transition: opacity 0.2s;
    backdrop-filter: blur(4px);
    cursor: pointer;
  }
  .group:hover .story-nav {
    opacity: 1;
  }
  .story-nav:hover {
    background: rgba(0, 0, 0, 0.7);
  }
</style>
