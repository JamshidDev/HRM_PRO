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

const onFocusCity = ()=>{
  if(componentStore.allCityList.length === 0){
    componentStore._allCities()
  }
}

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.organizationPage"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <div v-if="store.parentElement" class="w-full text-sm px-2 py-2 border rounded-xl border-surface-line mb-4 flex flex-col cursor-pointer">
        <span class="text-xs text-gray-500">{{$t(`organizationPage.selectedOrg`)}}</span>
        <span class="text-primary font-bold">{{store.parentElement?.name}}</span>
      </div>
      <n-form-item :label="$t(`organizationPage.form.name`)" path="name">
        <n-input
            type="text"

            v-model:value="store.payload.name"
        />
      </n-form-item>
      <n-form-item :label="$t(`organizationPage.form.full_name`)" path="full_name">
        <n-input
            type="text"

            v-model:value="store.payload.full_name"
        />
      </n-form-item>
      <n-form-item :label="$t(`organizationPage.form.level`)" path="level">
        <n-select
            v-model:value="store.payload.level"
            clearable
            filterable

            :options="componentStore.organizationLevelList"
            label-field="name"
            value-field="id"
            :loading="componentStore.organizationLevelLoading"
        />
      </n-form-item>
      <n-form-item :label="$t(`organizationPage.form.city_id`)" path="city_id">
        <n-select
            v-model:value="store.payload.city_id"
            clearable
            filterable
            @focus="onFocusCity"

            :options="componentStore.allCityList"
            label-field="name"
            value-field="id"
            :loading="componentStore.allCityLoading"
        />
      </n-form-item>
      <n-form-item
          v-if="!Boolean(store.parentElement)"
          :label="$t(`organizationPage.form.parent_id`)" path="parent_id">
        <n-select
            v-model:value="store.payload.parent_id"
            clearable
            filterable

            :options="componentStore.organizationList"
            label-field="name"
            value-field="id"
            :loading="componentStore.organizationLoading"
        />
      </n-form-item>
      <n-form-item :label="$t(`organizationPage.form.code`)" path="code">
        <n-input
            type="text"

            v-model:value="store.payload.code"
        />
      </n-form-item>
      <n-form-item path="code">
        <n-checkbox
            :label="$t(`organizationPage.form.group`)"

            v-model:checked="store.payload.group"
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