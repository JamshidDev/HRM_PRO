<script setup>
import validationRules from "@/utils/validationRules.js";
import {usePolyclinicStore, useComponentStore, useMedInspectionStore} from "@/store/modules/index.js";


const store = usePolyclinicStore()
const inspectionStore = useMedInspectionStore()
const formRef = ref(null)
const inputFileRef = ref(null)
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      store.saveLoading = true
      if (store.visibleType) {
        store._create()
      } else {
        store._update()
      }
    }
  })
}

const onUpload = async (v)=>{
  store.payload.file = v.target.files[0]
}
const onFile = (v)=>{
  inputFileRef.value.click()
}


onMounted(()=>{
  inspectionStore._polyclinics()
})


</script>

<template>
  <div style="height:calc(100vh - 120px)" class="overflow-y-auto">
    <n-form
        ref="formRef"
        :rules="validationRules.common"
        :model="store.payload"
    >
      <n-form-item :label="$t(`polyclinic.form.choosePolyclinic`)" path="polyclinics" :rule-path="validationRules.rulesNames.requiredMultiSelectField">
        <n-select
            multiple
            v-model:value="store.payload.polyclinics"
            filterable
            clearable
            :options="inspectionStore.hospitalList"
            label-field="name"
            value-field="id"
            :loading="inspectionStore.hospitalLoading"
        />
      </n-form-item>
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