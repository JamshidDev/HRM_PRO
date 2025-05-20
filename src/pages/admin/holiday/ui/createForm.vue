<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useHolidayStore, useComponentStore} from "@/store/modules/index.js";

const store = useHolidayStore()
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
  if(componentStore.holidayTypes.length === 0){
    componentStore._enumsAdmin()
  }

})

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.holidayPage"
      :model="store.payload"
  >
    <div>
      <n-form-item :label="$t(`holidayPage.form.holiday_date`)" path="holiday_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.holiday_date"
            type="date"

        />
      </n-form-item>
      <n-form-item :label="$t(`holidayPage.form.type`)" path="type">
        <n-select
            v-model:value="store.payload.type"
            filterable

            :options="componentStore.holidayTypes"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumAdminLoading"
        />
      </n-form-item>
      <n-form-item :label="$t(`holidayPage.form.name`)" path="name">
        <n-input
            type="text"

            v-model:value="store.payload.name"
        />
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-2 mt-12">
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