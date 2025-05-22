<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useLanguageAdminStore} from "@/store/modules/admin/languageAdminStore.js"

const store = useLanguageAdminStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveLoading = true
      if(store.visibleType){
        store._create()
      }else{
        store._update()
      }

    }
  })
}

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.languageAdminPage"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item :label="$t(`othersPage.language.form.nameUz`)" path="name">
        <n-input
            type="text"

            v-model:value="store.payload.name"
        />
      </n-form-item>
      <n-form-item :label="$t(`othersPage.language.form.nameRu`)" path="name_ru">
        <n-input
            type="text"

            v-model:value="store.payload.name_ru"
        />
      </n-form-item>
      <n-form-item :label="$t(`othersPage.language.form.nameEn`)" path="name_en">
        <n-input
            type="text"

            v-model:value="store.payload.name_en"
        />
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{$t('content.cancel')}}
      </n-button>
      <n-button
          @click="onSubmit"
          :loading="store.saveLoading"
          type="primary">
        {{$t('content.save')}}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>

</style>