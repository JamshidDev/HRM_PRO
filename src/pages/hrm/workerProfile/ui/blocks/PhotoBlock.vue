<script setup>
  import { UICropper, UIProfileButton } from '@/components/index.js'
  import { v4 as uuidv4 } from 'uuid'
  import Utils from '@/utils/Utils.js'
  import icons from '@/assets/icons'
  import ProfileBlock from '../ProfileBlock.vue'
  import { useWorkerProfileStore } from '@/store/modules/index.js'

  /** Figma "Kandidat rasmi" bloki (node 2609:74328) */
  const store = useWorkerProfileStore()
  const cropperRef = ref(null)
  const editing = ref(false)

  const MIN_PHOTOS = 3
  const MAX_PHOTOS = 8

  const missingCount = computed(() => Math.max(0, MIN_PHOTOS - store.photos.length))

  const onOpenFile = () => cropperRef.value?.openFile()

  const onResult = (v) => {
    const id = uuidv4()
    store.mainImgId = store.mainImgId || id
    store.photos.push({ id, blob: v.blob, base64: v.imgUrl, url: null })
  }

  const onRemove = (img) => {
    // Serverdagi rasm o'chiriladi, hali saqlanmagani ro'yxatdan olib tashlanadi
    if (img.id.toString().length > 10) {
      store.photos = store.photos.filter((x) => x.id !== img.id)
      if (store.mainImgId === img.id) store.mainImgId = store.photos?.[0]?.id ?? null
    } else {
      store._deletePhoto(img.id)
    }
  }

  const onCancel = () => {
    editing.value = false
    store._index()
  }

  const onSave = () => {
    store.savePhoto()
    editing.value = false
  }
</script>

<template>
  <ProfileBlock :title="$t('workerProfile.personal.photoTitle')" :icon="icons.figImageSquare">
    <div class="flex flex-wrap items-start gap-4 w-full">
      <div
        v-for="img in store.photos"
        :key="img.id"
        class="photo-tile"
        @click="store.mainImgId = img.id"
      >
        <img
          class="w-full h-full object-cover rounded-2xl"
          :src="img.base64 || Utils.noAvailableImage"
          @error="Utils.onImgError"
          alt=""
        />
        <span v-if="img.id === store.mainImgId" class="photo-tile__main">
          {{ $t('createWorkerPage.ui.mainImage') }}
        </span>
        <button v-if="editing" type="button" class="photo-tile__remove" @click.stop="onRemove(img)">
          <n-icon :size="16">
            <component :is="icons.figXmark" />
          </n-icon>
        </button>
      </div>

      <button
        v-if="editing && store.photos.length < MAX_PHOTOS"
        type="button"
        class="photo-add"
        @click="onOpenFile"
      >
        <n-icon :size="44" class="text-fig-text-tertiary">
          <component :is="icons.figImagePlus" />
        </n-icon>
        <span class="text-xs leading-4 text-fig-text-tertiary text-center">
          {{
            missingCount > 0
              ? $t('createWorkerPage.ui.needPhotos', { n: missingCount })
              : $t('createWorkerPage.ui.addPhoto')
          }}
        </span>
      </button>

      <span
        v-if="!editing && store.photos.length === 0"
        class="text-sm text-fig-text-tertiary py-4"
      >
        {{ $t('content.notFoundData') }}
      </span>

      <UICropper ref="cropperRef" @on-result="onResult" />
    </div>

    <template #actions>
      <template v-if="editing">
        <UIProfileButton variant="danger" @click="onCancel">
          {{ $t('content.cancel') }}
        </UIProfileButton>
        <UIProfileButton :loading="store.loading" @click="onSave">
          {{ $t('content.save') }}
        </UIProfileButton>
      </template>
      <UIProfileButton v-else @click="editing = true">{{ $t('content.edit') }}</UIProfileButton>
    </template>
  </ProfileBlock>
</template>

<style lang="scss" scoped>
  .photo-tile {
    position: relative;
    width: 120px;
    height: 160px;
    border-radius: 16px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .photo-tile__main {
    position: absolute;
    right: 8px;
    bottom: 8px;
    padding: 2px 8px;
    border-radius: 9999px;
    background: var(--fig-bg-brand-fill);
    color: #ffffff;
    font-size: 11px;
    font-weight: 600;
  }

  // Maketdagi ✕ tugmasi: yarim shaffof qora doira, orqa fon xiralashadi
  .photo-tile__remove {
    position: absolute;
    left: 8px;
    top: 8px;
    display: flex;
    align-items: center;
    padding: 4px;
    border: none;
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(15px);
    color: #ffffff;
    cursor: pointer;
  }

  .photo-add {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 120px;
    height: 160px;
    flex-shrink: 0;
    padding: 29px 8px;
    border: 1px dashed var(--fig-br-disable);
    border-radius: 16px;
    background: var(--fig-bg-disable);
    cursor: pointer;
  }
</style>
