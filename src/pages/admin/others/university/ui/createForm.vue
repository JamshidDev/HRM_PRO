<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useUniversityAdminStore, useComponentStore} from "@/store/modules/index.js"

const store = useUniversityAdminStore()
const compStore = useComponentStore()

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

const onFocus = ()=>{
  if(compStore.educationList.length ===0){
    compStore._enums()
  }
}

const onFocusRegion = ()=>{
  if(compStore.regionList.length === 0){
    compStore._regions()
  }

}


</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.universityAdmin"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item :label="$t(`othersPage.university.form.name`)" path="name">
        <n-input
            type="text"
            :placeholder="$t(`content.enterField`)"
            v-model:value="store.payload.name"
        />
      </n-form-item>
      <n-form-item :label="$t(`othersPage.university.form.name_ru`)" path="name_ru">
        <n-input
            type="text"
            :placeholder="$t(`content.enterField`)"
            v-model:value="store.payload.name_ru"
        />
      </n-form-item>
      <n-form-item :label="$t(`othersPage.university.form.region_id`)" path="region_id">
        <n-select
            @focus="onFocusRegion"
            v-model:value="store.payload.region_id"
            filterable
            :placeholder="$t(`content.choose`)"
            :options="compStore.regionList"
            label-field="name"
            value-field="id"
            :loading="compStore.regionLoading"
        />
      </n-form-item>
      <n-form-item :label="$t(`othersPage.university.form.education`)" path="education">
        <n-select
            @focus="onFocus"
            v-model:value="store.payload.education"
            filterable
            :placeholder="$t(`content.choose`)"
            :options="compStore.educationList"
            label-field="name"
            value-field="id"
            :loading="compStore.enumLoading"
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