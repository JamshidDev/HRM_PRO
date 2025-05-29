<script setup>
import {usePageInstructionStore} from "@/store/modules/index.js"
import {UIEditor, NoImage} from "@/components/index.js";
import validationRules from "@/utils/validationRules.js";
import {AddCircle24Regular, Delete16Filled} from '@vicons/fluent'
import Utils from "@/utils/Utils.js"

const formRef = ref(null)
const inputFileRef = ref(null)
const store = usePageInstructionStore()

const onClickAddImage = ()=>{
  inputFileRef.value?.click()
}

const onUpload = async (v) => {
  const files = v.target.files
  if (!files.length) return
  for (const file of files) {
    const base64Url = await Utils.fileToBase64(file)
    store.payload.photos.push({
      photo: base64Url,
      file
    })
  }
}

const onPaste = async (e)=>{
  const file = Array.from(e.clipboardData.files).find(file =>
      file.type.startsWith("image/")
  )
  if (file) {
    const base64Url = await Utils.fileToBase64(file)
    store.payload.photos.push({
      photo: base64Url,
      file
    })
  }
}

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      const data = new FormData()
      data.append('title', store.payload.title)
      data.append('text', store.payload.text)
      data.append('menu', store.payload.menu)
      data.append('sub_menu', store.payload.sub_menu)

      const photos = store.payload.photos.filter(v=>v.file)
      for(const photo of photos){
        data.append('photos[]', photo.file)
      }

      if (store.visibleType) {
        store._create(data)
      } else {
        data.append('_method', 'PUT')
        store._update(data)
      }
    }
  })
}

const showImage = (image)=>{
  $MediaViewer.showMediaViewer(image, 'jpg')
}


</script>

<template>
  <div style="height:calc(100vh - 140px)" class="overflow-y-auto overflow-x-hidden mb-[20px]">
    <n-form
        class="px-2"
        ref="formRef"
        :rules="validationRules.common"
        :model="store.payload"
    >
      <n-form-item @paste="onPaste" :show-label="false" path="photos" rule-path="requiredMultiSelectField" class="relative">
        <div v-if="!store.payload.photos.length" class="text-secondary/20 page_instruction_image flex justify-center flex-col items-center">
          <NoImage class="w-[200px]" />
          <p class="text-secondary/40 text-xl">{{$t('content.noImage')}}</p>
        </div>
        <n-carousel v-model:current-index="store.imgCarouselIdx" v-else :draggable="(store.payload.photos.length>1)" draggable autoplay show-arrow :show-dots="false">
          <n-carousel-item v-for="(item, idx) in store.payload.photos" :key="idx">
            <img
                @click="showImage(item.photo)"
                class="page_instruction_image cursor-pointer"
                :src="item.photo"
            >
          </n-carousel-item>
        </n-carousel>
        <div  class="absolute left-[5px] bottom-[5px]">
          <n-button-group  size="tiny">
            <n-button @click="onClickAddImage" type="primary">
              {{$t('content.add')}}
              <template #icon>
                <n-icon>
                  <AddCircle24Regular/>
                </n-icon>
              </template>
            </n-button>
            <n-button type="error" v-if="store.payload.photos.length" @click="store.deleteImage" :loading="store.imageLoading">
              {{$t('content.delete')}}
              <template #icon>
                <n-icon>
                  <Delete16Filled/>
                </n-icon>
              </template>
            </n-button>
          </n-button-group>
        </div>
        <input @change="onUpload" accept="image/*" class="hidden" type="file" ref="inputFileRef" multiple />
      </n-form-item>
      <n-form-item :label="$t('content.name')" path="title" rule-path="requiredStringField">
        <n-input v-model:value="store.payload.title" />
      </n-form-item>
      <UIEditor
          :label="$t('content.description')"
          v-model:text="store.payload.text"
          path="text"
          show-toolbar
          with-validation
      />
    </n-form>

  </div>
  <div class="grid grid-cols-2 gap-2">
    <n-button @click="store.resetForm" type="error" ghost>
      {{ $t('content.cancel') }}
    </n-button>
    <n-button
        @click="onSubmit"
        :loading="store.saveLoading"
        type="primary">
      {{ $t('content.save') }}
    </n-button>
  </div>
</template>
