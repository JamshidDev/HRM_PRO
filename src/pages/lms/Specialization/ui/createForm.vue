<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useSpecializationStore, useComponentStore} from "@/store/modules/index.js";

const store = useSpecializationStore()
const componentStore = useComponentStore()

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

onMounted(()=>{
  store.directionListParams.page = 1
  store.directionListParams.search = null
  store._directionList()
  if(!componentStore.positionList.length){
    componentStore._positions()
  }
})

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item :label="$t(`content.nameUz`)" path="name" rule-path="requiredStringField">
        <n-input
            type="text"
            v-model:value="store.payload.name"
        />
      </n-form-item>
      <n-form-item :label="$t(`content.nameRu`)" path="name" rule-path="requiredStringField">
        <n-input
            type="text"
            v-model:value="store.payload.name_ru"
        />
      </n-form-item>
      <n-form-item :label="$t(`content.nameEn`)" path="name" rule-path="requiredStringField">
        <n-input
            type="text"
            v-model:value="store.payload.name_en"
        />
      </n-form-item>
      <n-form-item :label="$t(`specializationPage.form.direction`)" path="direction_id" rule-path="requiredNumberField">
        <n-select
            v-model:value="store.payload.direction_id"
            @scroll="store.onScrollDirectionList"
            :options="store.directionList"
            :loading="store.directionListLoading"
            label-field="name"
            value-field="id"
            filterable
            :filter="()=>true"
            @search="store.onSearchDirectionList"
        />
      </n-form-item>
      <n-form-item :label="$t(`specializationPage.form.positions`)" path="positions" rule-path="requiredMultiSelectField">
        <n-select
            v-model:value="store.payload.positions"
            filterable
            multiple
            :max-tag-count="1"
            :options="componentStore.positionList"
            label-field="name"
            value-field="id"
            :loading="componentStore.positionLoading"
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