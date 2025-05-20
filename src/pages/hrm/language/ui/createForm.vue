<script setup>
import validationRules from "@/utils/validationRules.js";
import {CloudLink16Regular} from "@vicons/fluent"
import {useLanguageStore, useComponentStore} from "@/store/modules/index.js";
import Utils from "../../../../utils/Utils.js"

const store = useLanguageStore()
const formRef = ref(null)
const inputFileRef = ref(null)
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      const formData = new FormData()
      formData.append('uuid', store.uuid)
      formData.append('language_id', store.payload.language_id)

      store.saveLoading = true
      if (store.visibleType) {
        formData.append('file', store.payload.file ?? '')
        store._create(formData)
      } else {
        formData.append('file', store.payload.file?.size? store.payload.file : '')
        store._update(formData)
      }
    }
  })
}

const onUpload = async (v)=>{
  store.payload.file = v.target.files[0]
}
const onFile = (v)=>{
  inputFileRef.value.click()
}


onMounted(()=>{
  if(componentStore.maritalList.length === 0){
    componentStore._enums()
  }
})


</script>

<template>
  <div style="height:calc(100vh - 120px)" class="overflow-y-auto">
    <n-form
        ref="formRef"
        :rules="validationRules.languagePage"
        :model="store.payload"
    >
      <n-form-item :label="$t(`content.name`)" path="language_id">
        <n-select
            v-model:value="store.payload.language_id"
            filterable

            :options="componentStore.languageList"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
        />
      </n-form-item>
      <n-form-item :label="$t(`content.file`)" path="file">
       <n-button @click="onFile" style="width: 100%">
          <template #icon>
            <CloudLink16Regular/>
          </template>

         {{store.payload.file?.name? store.payload.file?.size? store.payload.file?.name :  Utils.fileNameFromUrl(store.payload.file?.name) : $t('languagePage.form.certificateFile')}}

       </n-button>
        <input @change="onUpload" type="file" v-show="false" ref="inputFileRef" />
      </n-form-item>
    </n-form>

  </div>
  <div class="grid grid-cols-2 gap-2">
    <n-button @click="store.openVisible(false)" type="error" ghost>
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

<style scoped>

</style>