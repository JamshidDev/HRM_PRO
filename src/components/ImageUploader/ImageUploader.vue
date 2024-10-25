<script setup>
import { ImageAdd24Regular, ArrowSyncDismiss20Filled} from '@vicons/fluent'
import { v4 as uuidv4 } from 'uuid';
import Utils from "@/utils/Utils.js";

const fileRef = ref(null)

const model = defineModel({
  required:true,
  default:[],
})

const props = defineProps({
  maxCount: {
    type: Number,
    default: 1
  }

})

const uploadImage = async(e)=>{
  const file = e.target.files[0]
  const base64 = await Utils.fileToBase64(file)
  model.value.push({
    id:uuidv4(),
    file:file,
    base64:base64,
    url:null,
  })
}

const removeImage = (id)=>{
  model.value = model.value.filter((v)=>v.id !== id)
}

</script>

<template>
<div class="w-full flex gap-2">
  <template v-for="(item, idx) in model" :key="idx">
    <div
        class="w-[100px] h-[100px] border border-surface-line rounded overflow-hidden relative"
    >
      <span
          @click="removeImage(item.id)"
      class="absolute top-[4px] right-[4px] bg-red-50 flex justify-center items-center p-[2px] border border-red-50 rounded cursor-pointer"
      >
        <n-icon class="text-danger text-xl">
        <ArrowSyncDismiss20Filled/>
      </n-icon>
      </span>

      <img class="w-full h-full object-cover" :src="item.url || item.base64" alt="">
    </div>
  </template>
  <template v-if="maxCount>model.length">
    <div
        @click="fileRef.click"
        class="w-[100px] h-[100px] border border-dashed rounded flex justify-center items-center border-surface-line cursor-pointer">
      <n-icon class="text-6xl text-surface-400 font-normal">
        <ImageAdd24Regular/>
      </n-icon>
    </div>
  </template>

    <input @change="uploadImage" ref="fileRef" class="hidden" type="file"/>
</div>
</template>

<style scoped>

</style>