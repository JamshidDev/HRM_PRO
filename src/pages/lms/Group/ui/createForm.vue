<script setup>
import validationRules from "@/utils/validationRules.js";
import {useLmsGroupStore, useEduPlanStore} from "@/store/modules/index.js";

const formRef = ref(null)
const store = useLmsGroupStore()
const eduPlanStore = useEduPlanStore()


const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveLoading = true
      const data = {
        ...store.payload
      }
      store._create(data, ()=>{
        eduPlanStore._index()
        eduPlanStore.groupVisible=false
      })
    }
  })
}

onMounted(()=>{
  store.payload.edu_plan_id = eduPlanStore.elementId
  if(store.eduPlanList.length === 0){
    store._eduPlans()
  }

})




</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
  >
    <div class="mt-2 mb-8">
      <n-form-item :label="$t(`groupPage.form.edu_plan_id`)" path="edu_plan_id" rule-path="requiredNumberField">
        <n-select
            v-model:value="store.payload.edu_plan_id"
            :options="store.eduPlanList"
            :loading="store.eduPlanLoading"
            label-field="name"
            value-field="id"
            filterable
            clearable
        />
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="eduPlanStore.groupVisible=false" type="error" ghost>
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

