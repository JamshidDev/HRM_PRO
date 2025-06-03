<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useMedInspectionStore, useComponentStore} from "@/store/modules/index.js";
import {UISelect} from "@/components/index.js"
import UIHelper from "@/utils/UIHelper.js"
import {useAppSetting} from "@/utils/index.js"

const store = useMedInspectionStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      store.saveLoading = true

      store.payload.worker_id = componentStore.workerList.filter((v)=>v.id === store.payload.worker_position_id)?.[0]?.worker?.id
      if (store.visibleType) {
        store._create()
      } else {
        store._update()
      }
    }
  })
}

const onChangeStructure = (v)=>{
  store.payload.organization_id = v
  componentStore.workerList = []
  store.payload.worker_position_id = null
  componentStore.workerParams.organization_id =v.length > 0? v[0].id : null
}

const onChangeWorker = (v)=>{

}



onMounted(()=>{
  store._polyclinics()
})


</script>

<template>
  <div style="height:calc(100vh - 120px)" class="overflow-y-auto">
    <n-form
        ref="formRef"
        :rules="validationRules.common"
        :model="store.payload"
    >

      <n-form-item
          :label="$t(`medInspection.form.hospital`)"
          path="hospital_id"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-select
            v-model:value="store.payload.hospital_id"
            filterable
            :options="store.hospitalList"
            label-field="name"
            value-field="id"
            :loading="store.hospitalLoading"
            :rule-path="validationRules.rulesNames.requiredNumberField"
        />
      </n-form-item>
      <n-form-item class="w-full" :label="$t(`documentPage.form.organization`)" path="organization_id">
        <UISelect
            :options="componentStore.structureList"
            :modelV="store.payload.organization_id"
            @updateModel="onChangeStructure"
            :checkedVal="store.structureCheck"
            @updateCheck="(v)=>store.structureCheck=v"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
            :loading="componentStore.structureLoading"
            :multiple="false"
            :auto-select="true"
        />
      </n-form-item>
      <n-form-item
          class="w-full"
          :label="$t(`documentPage.form.worker`)"
          path="worker_position_id"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-select
            :disabled="store.payload.organization_id.length === 0"
            v-model:value="store.payload.worker_position_id"
            filterable
            clearable
            :placeholder="$t('content.searchWorker')"
            :options="componentStore.workerList"
            label-field="name"
            value-field="id"
            :render-label="UIHelper.selectRender.label"
            :render-tag="UIHelper.selectRender.value"
            @update:value="onChangeWorker"
            :loading="componentStore.workerLoading"
            @scroll="componentStore.onScrollWorker"
            @search="componentStore.onSearchWorker"
            @update:show="componentStore.onOpenWorkerEv"
        />
      </n-form-item>
      <n-form-item
          :label="$t(`medInspection.form.start_date`)"
          path="start_date"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.start_date"
            type="date"
            :format="useAppSetting.datePicketFormat"
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