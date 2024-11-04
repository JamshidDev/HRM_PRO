<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useOrganizationStore, useComponentStore} from "@/store/modules/index.js";

const store = useOrganizationStore()
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

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.organizationPage"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item :label="$t(`organizationPage.form.name`)" path="name">
        <n-input
            type="text"
            :placeholder="$t(`organizationPage.form.name`)"
            v-model:value="store.payload.name"
        />
      </n-form-item>
      <n-form-item :label="$t(`organizationPage.form.full_name`)" path="full_name">
        <n-input
            type="text"
            :placeholder="$t(`organizationPage.form.full_name`)"
            v-model:value="store.payload.full_name"
        />
      </n-form-item>
      <n-form-item :label="$t(`organizationPage.form.level`)" path="level">
        <n-select
            v-model:value="store.payload.level"
            filterable
            :placeholder="$t(`organizationPage.form.level`)"
            :options="componentStore.organizationLevelList"
            label-field="value"
            value-field="key"
            :loading="componentStore.organizationLevelLoading"
        />
      </n-form-item>
      <n-form-item :label="$t(`organizationPage.form.parent_id`)" path="parent_id">
        <n-select
            v-model:value="store.payload.parent_id"
            filterable
            :placeholder="$t(`organizationPage.form.parent_id`)"
            :options="componentStore.organizationList"
            label-field="name"
            value-field="id"
            :loading="componentStore.organizationLoading"
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