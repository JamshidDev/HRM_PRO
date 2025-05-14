<script setup>
import {UIModal, UIUpload} from "@/components/index.js"
import {useComponentStore} from "@/store/modules/index.js"
import i18n from "@/i18n/index.js"

const {t} = i18n.global
const componentStore = useComponentStore()
const emits = defineEmits(['onSuccess'])
const props = defineProps({
  model:{
    type:String,
    required:true,
  },
  documentId:{
    type:Number,
    default:null,
  },
})



const onSubmit = ()=>{


  const formData = new FormData()
  if(componentStore.files.length>0){
    const file = componentStore.files[0].file
    formData.append('file', file)
  }
  formData.append('model', props.model)
  formData.append('document_id', props.documentId)
  componentStore._confirmFile(formData, ()=>{
    componentStore.fileVisible = false
    emits('onSuccess')
  })

  // if(componentStore.files.length>0){
  //
  //
  // }else{
  //   $Toast.warning(t('message.warning-data'))
  // }
}

</script>

<template>
  <UIModal
      :title="$t('content.file')"
      v-model:visible="componentStore.fileVisible"
  >
    <n-form
        ref="formRef"
        class="grid grid-cols-12 gap-x-4"
    >

      <p class="col-span-12 text-textColor1 mt-6 mb-2 ">{{$t('content.confirmFileText')}}</p>
      <UIUpload
          :accept="'.pdf'"
          :multiple="false"
          class="col-span-12 mb-4"
          v-model:files="componentStore.files"/>
    </n-form>

    <div class="grid grid-cols-2 gap-2">
      <n-button
          :loading="componentStore.fileLoading"
          @click="componentStore.fileVisible = false"
          type="error"
          ghost>
        {{$t('content.cancel')}}
      </n-button>
      <n-button
          :loading="componentStore.fileLoading"
          @click="onSubmit"
          type="primary">
        {{$t('content.save')}}
      </n-button>
    </div>
  </UIModal>
</template>

<style scoped>

</style>