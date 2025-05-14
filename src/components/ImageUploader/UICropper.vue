<script setup>
import 'vue-advanced-cropper/dist/style.css';
import { Cropper } from 'vue-advanced-cropper';
const cropperRef = ref(null)
const imageRef = ref(null)
const visible = ref(false)

const emits = defineEmits(['onResult'])

const image = ref({
  src: null,
  type: "image/jpg",
})

const openFile =()=>{
  imageRef.value?.click()
}

const uploadImage = (event)=>{
  const { files } = event.target;
  if (files && files[0]) {
    if (image.value.src) {
      URL.revokeObjectURL(image.value.src);
    }
    image.value.src = URL.createObjectURL(files[0])
    image.value.type =files[0].type
    visible.value = true;
  }
}

const onSave = ()=>{
  console.log(cropperRef.value)
 let imgUrl = cropperRef.value.getResult().canvas.toDataURL()
  cropperRef.value.getResult().canvas.toBlob((blob) => {
    emits('onResult', {blob, imgUrl})
  });
  visible.value = false

}

const onClose = ()=>{
    visible.value = false
}

const onChange = (v)=>{
}



defineExpose({
  openFile,
})
</script>

<template>
<n-modal v-model:show="visible">
<n-card
    size="small"
    role="card"
    aria-modal="true"
    class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    style="width:600px; position: fixed; right:50%;top:50%"
>
  <cropper
      ref="cropperRef"
      class="cropper !max-h-[90vh] !max-w-[90vw] overflow-hidden"
      :stencil-props="{
        aspectRatio: 3/4,
      }"
      :src="image.src"
      :autoZoom="true"
      @change="onChange"
  />
  <template #footer>
    <div class="grid grid-cols-2 gap-x-2">
      <n-button ghost
          @click="onClose"
          type="error">
        {{$t('content.cancel')}}
      </n-button> <n-button
        @click="onSave"
        type="primary">
      {{$t('content.save')}}
    </n-button>
    </div>
  </template>
</n-card>
</n-modal>
  <input type="file" accept="image/*" ref="imageRef" @change="uploadImage($event)" v-show="false" />
</template>