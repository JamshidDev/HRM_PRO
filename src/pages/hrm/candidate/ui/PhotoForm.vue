<script setup>
  import { UICropper, UIFigBlock } from '@/components/index.js'
  import { v4 as uuidv4 } from 'uuid'
  import validationRules from '@/utils/validationRules.js'
  import Utils from '@/utils/Utils.js'
  import icons from '@/assets/icons'

  /** Figma "Kandidat rasmi" bloki (node 3132:61857) */
  const images = defineModel('images', {
    required: true,
    default: [],
    type: Array
  })
  const mainImageId = defineModel('mainImageId', {
    required: true,
    default: null
  })

  const emits = defineEmits(['onDelete', 'onChangeMain'])

  const MIN_PHOTOS = 3
  const MAX_PHOTOS = 8

  const cropperRef = ref(null)
  // Yashirin n-form-item shu qiymat orqali `photos` qoidasini tekshiradi
  const fakeV = ref(null)

  const missingCount = computed(() => Math.max(0, MIN_PHOTOS - images.value.length))

  const onOpenFile = () => cropperRef.value?.openFile()

  const onResult = (v) => {
    const id = uuidv4()
    mainImageId.value = mainImageId.value || id
    images.value.push({ id, blob: v.blob, base64: v.imgUrl, url: null })
  }

  const onChange = (id) => {
    const savedMainImageId = images.value.filter((v) => v.current)?.[0]?.id
    emits('onChangeMain', savedMainImageId !== id)
  }

  const onChangeMain = (id) => {
    mainImageId.value = id
    onChange(id)
  }

  const onRemove = (img) => {
    emits('onDelete', img)
  }

  watch(images, () => onChange(mainImageId.value), { deep: true })

  watchEffect(() => {
    fakeV.value = images.value?.[0]?.id
  })
</script>

<template>
  <UIFigBlock :title="$t('workerProfile.personal.photoTitle')" :icon="icons.figImageSquare">
    <div class="flex flex-col gap-3 w-full">
      <div class="flex flex-wrap items-start gap-4 w-full">
        <div
          v-for="img in images"
          :key="img.id"
          class="photo-tile"
          :class="img.id === mainImageId && 'photo-tile--main'"
          @click="onChangeMain(img.id)"
        >
          <img
            class="w-full h-full object-cover rounded-2xl"
            :src="img.base64 || Utils.noAvailableImage"
            @error="Utils.onImgError"
            alt=""
          />
          <span v-if="img.id === mainImageId" class="photo-tile__main">
            {{ $t('createWorkerPage.ui.mainImage') }}
          </span>
          <button
            v-if="images.length > 1"
            type="button"
            class="photo-tile__remove"
            @click.stop="onRemove(img)"
          >
            <n-icon :size="16">
              <component :is="icons.figXmark" />
            </n-icon>
          </button>
        </div>

        <button
          v-if="images.length < MAX_PHOTOS"
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

        <UICropper ref="cropperRef" @on-result="onResult" />
      </div>

      <span class="text-xs leading-4 text-fig-text-tertiary">
        {{ $t('createWorkerPage.ui.image') }}
      </span>

      <n-form-item
        class="!block hidden-form-item"
        path="photos"
        :show-label="false"
        :show-feedback="true"
        :rule-path="validationRules.rulesNames.requiredPhotoField"
      >
        <n-select
          v-show="false"
          multiple
          v-model:value="fakeV"
          filterable
          label-field="id"
          value-field="id"
          :options="images"
        />
      </n-form-item>
    </div>
  </UIFigBlock>
</template>

<style lang="scss" scoped>
  .photo-tile {
    position: relative;
    width: 120px;
    height: 160px;
    flex-shrink: 0;
    border-radius: 16px;
    cursor: pointer;
  }

  .photo-tile--main img {
    outline: 2px solid var(--fig-bg-brand-fill);
    outline-offset: 2px;
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
    transition: border-color 0.15s ease;

    &:hover {
      border-color: var(--fig-neutral-300);
    }
  }
</style>
