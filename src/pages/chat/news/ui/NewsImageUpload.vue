<script setup>
  import {
    Dismiss16Regular,
    DocumentLink24Regular,
    Video24Regular,
    Delete20Regular,
    ArrowClockwise20Filled
  } from '@vicons/fluent'
  import { v4 as uuidv4 } from 'uuid'
  import 'vue-advanced-cropper/dist/style.css'
  import { Cropper } from 'vue-advanced-cropper'
  import ImagePlusIcon from '@/assets/icons/imagePlus.svg'

  defineProps({
    accept: {
      type: String,
      default: '.png,.jpg,.jpeg,.pdf,.doc,.docx,.mp4,.mpeg,.avi'
    },
    cropAspect: {
      type: Number,
      default: 4 / 3
    },
    disabled: {
      type: Boolean,
      default: false
    }
  })

  const files = defineModel('files', { default: () => [] })

  const inputFileRef = ref(null)
  const previewUrls = new Map()

  const isImageFile = (item) => {
    if (item.file) return item.file.type.startsWith('image/')
    if (item.type) return item.type === 'image'
    return /\.(png|jpe?g|gif|webp)$/i.test(item.path ?? item.name ?? '')
  }

  const isVideoFile = (item) => {
    if (item.file) return item.file.type.startsWith('video/')
    if (item.type) return item.type === 'video'
    return /\.(mp4|mpeg|avi|mov)$/i.test(item.path ?? item.name ?? '')
  }

  const previewSrc = (item) => {
    if (item.path) return item.path
    if (!previewUrls.has(item.id)) previewUrls.set(item.id, URL.createObjectURL(item.file))
    return previewUrls.get(item.id)
  }

  const revokePreview = (id) => {
    if (previewUrls.has(id)) {
      URL.revokeObjectURL(previewUrls.get(id))
      previewUrls.delete(id)
    }
  }

  onBeforeUnmount(() => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url))
    previewUrls.clear()
  })

  // ── Crop ─────────────────────────────────────────────────────────────────────
  const cropperRef = ref(null)
  const showCropper = ref(false)
  const cropQueue = ref([])
  const currentCropImage = ref({ src: null, type: 'image/jpeg', name: '' })
  const replaceTargetId = ref(null)

  const processQueue = () => {
    const file = cropQueue.value[0]
    if (currentCropImage.value.src) URL.revokeObjectURL(currentCropImage.value.src)
    currentCropImage.value = { src: URL.createObjectURL(file), type: file.type, name: file.name }
    showCropper.value = true
  }

  const onCropSave = () => {
    const { type, name } = currentCropImage.value
    cropperRef.value.getResult().canvas.toBlob((blob) => {
      const file = new File([blob], name, { type })
      if (replaceTargetId.value) {
        replaceFile(replaceTargetId.value, file, name)
        replaceTargetId.value = null
      } else {
        files.value.push({ id: uuidv4(), name, file })
      }
      cropQueue.value.shift()
      if (cropQueue.value.length) {
        processQueue()
      } else {
        showCropper.value = false
        URL.revokeObjectURL(currentCropImage.value.src)
      }
    }, type)
  }

  const onCropCancel = () => {
    URL.revokeObjectURL(currentCropImage.value.src)
    cropQueue.value.shift()
    if (cropQueue.value.length) {
      processQueue()
    } else {
      showCropper.value = false
      replaceTargetId.value = null
    }
  }

  // ── Upload / delete / replace ─────────────────────────────────────────────────
  const onAdd = () => {
    inputFileRef.value.click()
  }

  const onUpload = (e) => {
    const list = e.target.files
    if (!list.length) return

    for (const file of Array.from(list)) {
      if (file.type.startsWith('image/')) {
        cropQueue.value.push(file)
      } else {
        files.value.push({ id: uuidv4(), name: file.name, file })
      }
    }
    if (cropQueue.value.length) processQueue()

    e.target.value = ''
  }

  const onDelete = (item) => {
    revokePreview(item.id)
    files.value = files.value.filter((x) => x.id !== item.id)
  }

  const replaceFile = (id, file, name) => {
    revokePreview(id)
    files.value = files.value.map((x) => (x.id === id ? { id, name, file } : x))
    if (previewItem.value?.id === id) previewItem.value = files.value.find((x) => x.id === id)
  }

  // ── Preview modal ────────────────────────────────────────────────────────────
  const previewItem = ref(null)
  const replaceInputRef = ref(null)

  const showPreview = computed({
    get: () => !!previewItem.value,
    set: (v) => {
      if (!v) previewItem.value = null
    }
  })

  const openPreview = (item) => {
    previewItem.value = item
  }

  const onReplaceClick = () => {
    replaceTargetId.value = previewItem.value.id
    replaceInputRef.value.click()
  }

  const onReplaceUpload = (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return

    if (file.type.startsWith('image/')) {
      cropQueue.value.push(file)
      processQueue()
    } else {
      replaceFile(replaceTargetId.value, file, file.name)
      replaceTargetId.value = null
    }
  }

  const onDeleteFromPreview = () => {
    onDelete(previewItem.value)
    previewItem.value = null
  }
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <template v-for="item in files" :key="item.id">
      <div class="relative w-[155px] h-[104px] shrink-0">
        <div
          class="w-full h-full rounded-xl border border-surface-line overflow-hidden cursor-pointer"
          @click="openPreview(item)"
        >
          <img
            v-if="isImageFile(item)"
            :src="previewSrc(item)"
            class="w-full h-full object-cover"
            alt=""
          />
          <div
            v-else
            class="w-full h-full flex flex-col items-center justify-center gap-1 bg-surface-ground px-1"
          >
            <n-icon size="22" class="text-textColor3">
              <Video24Regular v-if="isVideoFile(item)" />
              <DocumentLink24Regular v-else />
            </n-icon>
            <span class="text-[10px] text-textColor3 line-clamp-2 text-center">{{
              item.name
            }}</span>
          </div>
        </div>
        <button
          type="button"
          :disabled="disabled"
          class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
          @click.stop="onDelete(item)"
        >
          <n-icon size="13" color="#fff"><Dismiss16Regular /></n-icon>
        </button>
      </div>
    </template>

    <div
      class="news-image-add-tile w-[150px] h-[105px] rounded-xl bg-[#F9FAFB] flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0 transition-colors border-2 border-dashed border-[#EAECF0]"
      :class="{ 'pointer-events-none opacity-60': disabled }"
      @click="onAdd"
    >
      <ImagePlusIcon class="w-10 h-10" />
      <span class="text-[10px] text-textColor3 text-center px-1">{{
        $t('newsPage.attachmentsHint')
      }}</span>
    </div>

    <input
      ref="inputFileRef"
      type="file"
      multiple
      :accept="accept"
      v-show="false"
      @change="onUpload"
    />

    <input
      ref="replaceInputRef"
      type="file"
      :accept="accept"
      v-show="false"
      @change="onReplaceUpload"
    />

    <!-- ── Preview modal ────────────────────────────────────────────────────── -->
    <n-modal
      v-model:show="showPreview"
      :mask-closable="true"
      style="background: transparent; box-shadow: none; padding: 0"
    >
      <div v-if="previewItem" class="flex flex-col items-center gap-4" @click.stop>
        <div class="w-[min(90vw,1100px)] h-[580px] rounded-2xl overflow-hidden">
          <img
            v-if="isImageFile(previewItem)"
            :src="previewSrc(previewItem)"
            class="w-full h-full object-cover"
            alt=""
          />
          <video
            v-else-if="isVideoFile(previewItem)"
            :src="previewSrc(previewItem)"
            class="w-full h-full object-cover"
            controls
          />
          <div v-else class="w-full h-full flex flex-col items-center justify-center gap-2">
            <n-icon size="40" class="text-textColor3"><DocumentLink24Regular /></n-icon>
            <span class="text-sm text-textColor3">{{ previewItem.name }}</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <n-button type="error" @click="onDeleteFromPreview">
            <template #icon>
              <n-icon><Delete20Regular /></n-icon>
            </template>
            {{ $t('content.delete') }}
          </n-button>
          <n-button type="primary" @click="onReplaceClick">
            <template #icon>
              <n-icon><ArrowClockwise20Filled /></n-icon>
            </template>
            {{ $t('content.replace') }}
          </n-button>
        </div>
      </div>
    </n-modal>

    <n-modal v-model:show="showCropper" :mask-closable="false">
      <n-card
        size="small"
        role="dialog"
        aria-modal="true"
        style="width: 700px; position: fixed; right: 50%; top: 50%; transform: translate(50%, -50%)"
      >
        <Cropper
          ref="cropperRef"
          class="cropper !max-h-[70vh] !max-w-[90vw] overflow-hidden"
          :src="currentCropImage.src"
          :stencil-props="{ aspectRatio: cropAspect }"
          :auto-zoom="true"
        />
        <template #footer>
          <div class="grid grid-cols-2 gap-x-2">
            <n-button ghost type="error" @click="onCropCancel">{{ $t('content.cancel') }}</n-button>
            <n-button type="primary" @click="onCropSave">{{ $t('content.save') }}</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<style lang="scss" scoped>
  .news-image-add-tile:hover {
    background-color: #eaecf0 !important;
  }

  [data-theme='dark'] {
    .news-image-add-tile {
      background-color: var(--surface-section) !important;
      border-color: var(--surface-line) !important;
    }

    .news-image-add-tile:hover {
      background-color: var(--table-header) !important;
    }
  }
</style>
