<script setup>
  import { UIModal } from '@/components/index.js'
  import StoryPreview from './StoryPreview.vue'
  import { useMobileStoryStore } from '@/store/modules/index.js'
  import { Dismiss12Filled, ImageAdd24Regular, Play24Filled } from '@vicons/fluent'

  const store = useMobileStoryStore()

  const fileInput = ref(null)
  const previewVisible = ref(false)
  const previewIndex = ref(0)

  // Story hali yaratilmagan bo'lsa (create) slaydlar lokal to'planadi.
  const isPending = computed(() => !store.elementId)

  const triggerUpload = () => fileInput.value?.click()
  // Ketma-ket — siqish async, parallel yuborilsa sort takrorlanadi.
  const onPickFiles = async (e) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    for (const f of files) {
      if (isPending.value) store._addPendingSlide(f)
      else await store._addSlide(f)
    }
  }

  const openPreview = (index) => {
    previewIndex.value = index
    previewVisible.value = true
  }
</script>

<template>
  <div class="flex flex-wrap items-stretch gap-3">
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      multiple
      accept=".png,.jpg,.jpeg,.webp,.mp4,.mov,.webm"
      @change="onPickFiles"
    />

    <div v-for="(s, i) in store.displaySlides" :key="s.id" class="slide-tile" @click="openPreview(i)">
      <video v-if="s.media_type === 'video'" :src="s.url" class="slide-media" muted preload="metadata" />
      <img v-else :src="s.url" class="slide-media" alt="" />
      <n-icon v-if="s.media_type === 'video'" :component="Play24Filled" :size="20" class="slide-play" />

      <!-- O'chirish: lokal element darhol, yuklangan slayd tasdiq bilan -->
      <button v-if="s.pending" class="slide-remove" @click.stop="store._removePendingSlide(s.id)">
        <n-icon :component="Dismiss12Filled" :size="12" />
      </button>
      <n-popconfirm v-else @positive-click="store._deleteSlide(s.id)">
        <template #trigger>
          <button class="slide-remove" @click.stop>
            <n-icon :component="Dismiss12Filled" :size="12" />
          </button>
        </template>
        {{ $t('mobileStoryPage.slideDeleteConfirm') }}
      </n-popconfirm>

      <div v-if="store.slideDeletingId === s.id" class="slide-loading">
        <n-spin :size="16" />
      </div>
    </div>

    <!-- Qo'shish tile -->
    <n-tooltip trigger="hover">
      <template #trigger>
        <button class="slide-add" :disabled="store.slideUploading" @click="triggerUpload">
          <n-spin v-if="store.slideUploading" :size="18" />
          <n-icon v-else :component="ImageAdd24Regular" :size="26" />
        </button>
      </template>
      {{ $t('mobileStoryPage.form.addSlideHint') }}
    </n-tooltip>

    <UIModal
      v-model:visible="previewVisible"
      :title="$t('mobileStoryPage.form.preview')"
      :width="380"
      height="min(94vh, 900px)"
      :persistent="false"
    >
      <StoryPreview :key="previewIndex" :start-index="previewIndex" />
    </UIModal>
  </div>
</template>

<style scoped>
  .slide-tile {
    position: relative;
    width: 92px;
    height: 112px;
    border-radius: 12px;
    overflow: hidden;
    background: var(--surface-ground);
    cursor: pointer;
    transition:
      transform 0.15s,
      box-shadow 0.15s;
  }
  .slide-tile:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px -10px rgba(16, 24, 40, 0.4);
  }
  .slide-media {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .slide-play {
    position: absolute;
    inset: 0;
    margin: auto;
    color: rgba(255, 255, 255, 0.9);
    pointer-events: none;
  }
  .slide-remove {
    position: absolute;
    top: 6px;
    right: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 999px;
    background: rgba(52, 64, 84, 0.75);
    color: #fff;
    cursor: pointer;
    transition: background-color 0.15s;
  }
  .slide-remove:hover {
    background: var(--danger-color);
  }
  .slide-loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
  }
  .slide-add {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 92px;
    height: 112px;
    border: 1px dashed var(--surface-line);
    border-radius: 12px;
    background: var(--surface-ground);
    color: var(--textColor3);
    cursor: pointer;
    transition:
      color 0.15s,
      border-color 0.15s;
  }
  .slide-add:hover:not(:disabled) {
    color: var(--primary-color);
    border-color: var(--primary-color);
  }
  .slide-add:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
</style>
