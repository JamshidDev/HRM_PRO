<script setup>
import validationRules from "@/utils/validationRules.js";
import {useTeacherStore} from "@/store/modules/index.js";
import checkWorkerSelect from './checkWorkerSelect.vue'

const formRef = ref(null)
const store = useTeacherStore()


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
  store.subjectsParams.page = 1
  store.subjectsParams.search = null
  store._subjects()
})



</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item :label="$t(`teacherPage.form.worker`)" path="worker_id" rule-path="requiredStringField">
        <checkWorkerSelect v-model:value="store.payload.worker_id" />
      </n-form-item>

      <n-form-item :label="$t(`teacherPage.form.subjects`)" path="subjects" rule-path="requiredMultiSelectField">
        <n-select
            v-model:value="store.payload.subjects"
            multiple
            @scroll="store.onScrollSubjects"
            :options="store.subjects"
            :loading="store.subjectsLoading"
            label-field="name"
            value-field="id"
            filterable
            :filter="()=>true"
            @search="store.onSearchSubjects"
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

