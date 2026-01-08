<script setup>
  import 'vue-advanced-cropper/dist/style.css'
  import { Cropper } from 'vue-advanced-cropper'
  const cropperRef = ref(null)
  const imageRef = ref(null)
  const visible = ref(false)
  const originFileSizeInBytes = ref(0)
  const croppedFileSizeInKB = ref(0)

  const emits = defineEmits(['onResult'])

  const image = ref({
    src: null,
    type: 'image/jpg'
  })

  const openFile = () => {
    imageRef.value?.click()
  }

  const uploadImage = (event) => {
    const { files } = event.target
    if (files && files[0]) {
      originFileSizeInBytes.value = files[0]?.size
      if (image.value.src) {
        URL.revokeObjectURL(image.value.src)
      }
      image.value.src = URL.createObjectURL(files[0])
      image.value.type = files[0].type
      visible.value = true
    }
  }

  const onSave = () => {
    let imgUrl = cropperRef.value.getResult().canvas.toDataURL(image.value.type)
    cropperRef.value.getResult().canvas.toBlob((blob) => {
      emits('onResult', { blob, imgUrl })
    }, image.value.type)
    visible.value = false
  }

  const originSize = computed(() => {
    if (!originFileSizeInBytes.value) return 0
    return (originFileSizeInBytes.value / 1024).toFixed(2)
  })

  const onClose = () => {
    visible.value = false
  }

  const onChange = async (v) => {
    let imgUrl = cropperRef.value.getResult().canvas.toDataURL(image.value.type)
    croppedFileSizeInKB.value = calculateBase64Size(imgUrl)
  }

  const calculateBase64Size = (base64) => {
    // `data:image/jpeg;base64,...` qismini olib tashlaymiz
    const base64Data = base64.split(',')[1]

    const padding = (base64Data.match(/=+$/) || [''])[0].length
    const sizeInBytes = (base64Data.length * 3) / 4 - padding
    const sizeInKB = sizeInBytes / 1024

    return Number(sizeInKB.toFixed(2))
  }

  defineExpose({
    openFile
  })
</script>

<template>
  <n-modal v-model:show="visible">
    <n-card
      size="small"
      role="card"
      aria-modal="true"
      class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style="width: 600px; position: fixed; right: 50%; top: 50%"
    >
      <cropper
        ref="cropperRef"
        class="cropper !max-h-[90vh] !max-w-[90vw] overflow-hidden"
        :stencil-props="{
          aspectRatio: 3 / 4
        }"
        :src="image.src"
        :autoZoom="true"
        @change="onChange"
      />
      <template #footer>
        <div class="grid grid-cols-2 gap-x-2">
          <n-button ghost @click="onClose" type="error">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button @click="onSave" type="primary">
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>
    </n-card>
  </n-modal>
  <input type="file" accept="image/*" ref="imageRef" @change="uploadImage($event)" v-show="false" />
</template>
