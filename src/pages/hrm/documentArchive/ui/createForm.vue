<script setup>
import validationRules from "@/utils/validationRules.js";
import {UIUpload} from "@/components/index.js"

const formRef = ref(null)
import {useComponentStore, useDocumentArchiveStore} from "@/store/modules/index.js"
import {useAppSetting} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"

const store = useDocumentArchiveStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      console.log(store.payload.description)
      const formData = new FormData()
      formData.append('visibility_type', store.payload.visibility_type)
      formData.append('title', store.payload.title)
      formData.append('description', store.payload.description)
      formData.append('type', store.payload.type)
      formData.append('document_date', Utils.timeToZone(store.payload.document_date))


      if (store.visibleType) {
        store._create(formData)
        formData.append('file', store.payload.file[0]?.file)
      } else {
        formData.append('_method', 'PUT')
        console.log(store.payload.file)
        if(typeof store.payload.file[0]?.file !== 'string'){
          formData.append('file', store.payload.file[0]?.file)
        }
        store._update(formData)
      }


    }
  })
}

watchEffect(()=>{
  store.payload.fakeFile = store.payload.file.length>0? 'valid':null
  if(store.payload.file.length>0){
    store.payload.title = store.payload.file[0].name?.replace(/\..*$/, '')
  }

})

onMounted(()=>{
  if(componentStore.organizationDocumentTypes.length === 0){
    componentStore._enums()
  }

})

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.documentArchive"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item :label="$t(`documentArchive.form.file`)" path="fakeFile">
        <n-input
            v-show="false"
            v-model:value="store.payload.fakeFile"
            type="text"

        />
        <UIUpload
            v-model:files="store.payload.file"
            :multiple="false"
            :accept="'.pdf,.doc,.docx,.xlsx,.xls'"
        />
      </n-form-item>


      <n-form-item :label="$t(`documentArchive.form.title`)" path="title">
        <n-input
            v-model:value="store.payload.title"
            type="text"

        />
      </n-form-item>
      <n-form-item :label="$t(`documentArchive.form.description`)" path="description">
        <n-input
            v-model:value.trim="store.payload.description"
            type="textarea"

        />
      </n-form-item>
      <n-form-item :label="$t(`documentArchive.form.visibility_type`)"
                   path="visibility_type">
        <n-select
            v-model:value="store.payload.visibility_type"
            filterable
            clearable

            :options="store.visibleTypes"
            label-field="name"
            value-field="id"
        />
      </n-form-item>
      <n-form-item :label="$t(`documentArchive.form.type`)" path="type">
        <n-select
            v-model:value="store.payload.type"
            filterable
            clearable

            :options="componentStore.organizationDocumentTypes"
            :loading="componentStore.enumLoading"
            label-field="name"
            value-field="id"
        />
      </n-form-item>
      <n-form-item :label="$t(`documentArchive.form.document_date`)" path="document_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.document_date"
            type="date"

            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>




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
  </n-form>
</template>

<style scoped>

</style>