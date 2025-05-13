<script setup>
import {UIModal, UIUpload} from "@/components/index.js"
import {useComponentStore} from "@/store/modules/index.js"
import validationRules from "@/utils/validationRules.js"
import i18n from "@/i18n/index.js"

const {t} = i18n.global
const componentStore = useComponentStore()
const payload =  ref({
  files:[],
})
const formRef = ref(null)

const onSubmit = ()=>{
 if(payload.value.files.length>0){

 }else{
   $Toast.warning(t('message.warning-data'))
 }
}

</script>

<template>
  <UIModal
      :title="$t('content.file')"
      v-model:visible="componentStore.fileVisible"
  >
    <n-form
        ref="formRef"
        :model="payload"
        :rules="validationRules.commandFrom"
        class="grid grid-cols-12 gap-x-4"
    >
      <UIUpload
          :multiple="false"
          class="col-span-12 mt-10 mb-4"
          v-model:files="payload.files"/>
    </n-form>

    <div class="grid grid-cols-2 gap-2">
      <n-button
          @click="componentStore.fileVisible = false"
          type="error"
          ghost>
        {{$t('content.cancel')}}
      </n-button>
      <n-button
          @click="onSubmit"
          type="primary">
        {{$t('content.save')}}
      </n-button>
    </div>
  </UIModal>
</template>

<style scoped>

</style>