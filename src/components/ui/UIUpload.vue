<script setup>
  import { CloudArrowUp24Regular, DocumentLink24Regular, Delete48Filled } from '@vicons/fluent'
  import { v4 as uuidv4 } from 'uuid'
  import { VueDraggable } from 'vue-draggable-plus'
  import 'vue-advanced-cropper/dist/style.css'
  import { Cropper } from 'vue-advanced-cropper'

  const props = defineProps({
    multiple: {
      type: Boolean,
      default: true
    },
    showDelete: {
      type: Boolean,
      default: true
    },
    accept: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    },
    orderable: {
      type: Boolean,
      default: false
    },
    crop: {
      type: Boolean,
      default: false
    },
    cropAspect: {
      type: Number,
      default: undefined
    }
  })

  const inputFileRef = ref(null)
  const files = defineModel('files', { default: [] })
  const emits = defineEmits(['onDelete'])

  // ── Crop state ───────────────────────────────────────────────────────────────
  const cropperRef = ref(null)
  const showCropper = ref(false)
  const cropQueue = ref([])
  const currentCropImage = ref({ src: null, type: 'image/jpeg', name: '' })

  const processQueue = () => {
    const file = cropQueue.value[0]
    if (currentCropImage.value.src) URL.revokeObjectURL(currentCropImage.value.src)
    currentCropImage.value = { src: URL.createObjectURL(file), type: file.type, name: file.name }
    showCropper.value = true
  }

  const onCropSave = () => {
    const { type, name } = currentCropImage.value
    cropperRef.value.getResult().canvas.toBlob((blob) => {
      files.value.push({ id: uuidv4(), name, file: new File([blob], name, { type }) })
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
    }
  }

  // ── Upload ───────────────────────────────────────────────────────────────────
  const onFile = () => {
    inputFileRef.value.click()
  }

  const onUpload = (v) => {
    const list = v.target.files
    if (!list.length) return
    const fileList = props.multiple ? Array.from(list) : [list[0]]

    if (props.crop) {
      for (const file of fileList) {
        if (file.type.startsWith('image/')) {
          cropQueue.value.push(file)
        } else {
          files.value.push({ id: uuidv4(), name: file.name, file })
        }
      }
      if (cropQueue.value.length) processQueue()
    } else {
      if (props.multiple) {
        for (const file of fileList) {
          files.value.push({ id: uuidv4(), name: file.name, file })
        }
      } else {
        files.value = [{ id: uuidv4(), name: fileList[0].name, file: fileList[0] }]
      }
    }

    v.target.value = ''
  }

  const onDelete = (v) => {
    if (v.file) {
      files.value = files.value.filter((x) => x.id !== v.id)
    } else {
      emits('onDelete', v)
    }
  }
</script>

<template>
  <div class="flex w-full flex-col">
    <div>
      <n-button :disabled="disabled" style="width: 100%" @click="onFile" type="default" secondary>
        <template #icon>
          <CloudArrowUp24Regular />
        </template>
        {{ $t('content.attachFile') }}
      </n-button>
      <input
        :accept="accept"
        @change="onUpload"
        v-show="false"
        type="file"
        ref="inputFileRef"
        :multiple="multiple"
      />
    </div>
    <template v-if="$slots.content">
      <slot name="content" :files="files" :onDelete="onDelete" />
    </template>
    <component
      :is="orderable ? VueDraggable : 'div'"
      v-else
      v-model="files"
      class="flex flex-wrap mt-3 gap-2"
    >
      <template v-for="(item, idx) in files" :key="idx">
        <div
          class="flex items-center gap-2 p-2 border border-surface-line rounded-md min-w-[100px] max-w-[300px] cursor-pointer bg-white hover:bg-surface-100 relative overflow-hidden ui__upload pr-6"
        >
          <n-icon size="18" class="text-surface-400">
            <DocumentLink24Regular />
          </n-icon>
          <span class="text-xs line-clamp-1">{{ item.name }}</span>
          <span
            class="inline-block absolute right-[4px] top-[6px] opacity-0 ui__upload-icon transition-all duration-300"
          >
            <n-icon v-if="showDelete" size="20" class="text-danger" @click="onDelete(item)">
              <Delete48Filled />
            </n-icon>
          </span>
        </div>
      </template>
    </component>

    <!-- ── Crop Modal ──────────────────────────────────────────────────────── -->
    <n-modal v-if="crop" v-model:show="showCropper" :mask-closable="false">
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
          :stencil-props="cropAspect ? { aspectRatio: cropAspect } : {}"
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
  .ui__upload {
    &:hover {
      .ui__upload-icon {
        opacity: 1;
      }
    }
  }
</style>
