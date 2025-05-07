<script setup>
import {CameraAdd48Filled, DismissCircle48Regular} from "@vicons/fluent"
import {UICropper} from "@/components/index.js"
import { v4 as uuidv4 } from 'uuid';

const images = defineModel('images',{
  required:true,
  default:[],
  type:Array,
})
const mainImageId = defineModel('mainImageId',{
  required:true,
  default:null,
})

const cropper_ref = ref(null)

const emits = defineEmits(['onDelete'])

const onOpenFile = ()=>{
  cropper_ref.value.openFile()
}

const onResult = (v)=>{
  let id  =uuidv4()
  mainImageId.value = mainImageId.value || id
  images.value.push({
    id,
    blob:v.blob,
    base64:v.imgUrl,
    url:null,
  })
}

const deleteEv = (v)=>{
  emits('onDelete',v)
}

const onchangeMain = (id)=>{
  mainImageId.value = id
}

</script>

<template>
<div class="flex gap-4 flex-wrap w-full py-4">
  <template v-for="(img,idx) in images" :key="idx">
    <div
        @click="onchangeMain(img.id)"
        class="w-[120px] h-[160px] overflow-hidden rounded-sm  cursor-pointer transition-all relative show__delete-image"
        :class="[img.id === mainImageId? 'border-4 border-primary' : 'border border-gray-300']"
    >
      <img
          class="w-full h-full object-cover"
          :src="img.base64"
          alt=""
      >
      <div v-if="images.length>1" class="photo__delete-btn w-[30px] h-[30px] rounded-full bg-danger flex justify-center items-center absolute bottom-[-30px] transition-all z-10 left-1/2 translate-x-[-50%]">
        <n-icon @click="deleteEv(img)" size="26" class="text-white">
          <DismissCircle48Regular/>
        </n-icon>
      </div>

    </div>
  </template>
  <div
      v-if="images.length<8"
      @click="onOpenFile"
      class="w-[120px] h-[160px] border border-dashed border-gray-300 flex justify-center items-center cursor-pointer rounded-sm">
      <n-icon size="80" class="text-gray-500">
        <CameraAdd48Filled/>
      </n-icon>
  </div>
  <UICropper
      ref="cropper_ref"
      @on-result="onResult"
  />
</div>
</template>
