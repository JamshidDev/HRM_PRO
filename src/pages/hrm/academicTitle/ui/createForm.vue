<script setup>
import {UIUpload} from "@/components/index.js"
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useAcademicTitleStore, useComponentStore} from "@/store/modules/index.js";

const store = useAcademicTitleStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      const files = store.payload.file.filter(v=>v.file)
      console.log(store.payload.file)
      const formData = new FormData()
      formData.append('uuid', store.uuid)
      formData.append('type', store.payload.type)
      formData.append('file', files?.[0]?.file || '')

      store.saveLoading = true
      if (store.visibleType) {
        store._create(formData)
      } else {
        store._update(formData)
      }
    }
  })
}



onMounted(()=>{
  if(componentStore.academicTitleList.length === 0){
    componentStore._enums()
  }
})


</script>

<template>
  <div style="height:calc(100vh - 120px)" class="overflow-y-auto">
    <n-form
        ref="formRef"
        :rules="validationRules.academicTitlePage"
        :model="store.payload"
    >

      <n-form-item :label="$t(`academicTitlePage.form.type`)" path="type">
        <n-select
            v-model:value="store.payload.type"
            filterable
            :placeholder="$t(`content.choose`)"
            :options="componentStore.academicTitleList"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
        />
      </n-form-item>
      <UIUpload
          :showDelete="false"
          :multiple="false"
          v-model:files="store.payload.file"
      />
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