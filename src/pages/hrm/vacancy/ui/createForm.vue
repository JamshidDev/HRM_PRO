<script setup>
import validationRules from "@/utils/validationRules.js";
import {useComponentStore, useVacancyStore} from "@/store/modules/index.js"
import UIHelper from "@/utils/UIHelper.js"
import {useAppSetting} from "@/utils/index.js"
import {UIEditor} from "@/components/index.js"

const formRef = ref(null)

const store = useVacancyStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      if (store.visibleType) {
        store._create()
      } else {
        store._update()
      }
    }
  })
}

const onSelect = (v)=>{
  const data = store.vacancyPositions.filter((x)=>x.id ===v)[0]
  store.payload.salary = data.salary?.toString()
  store.payload.rate = (data.rate - data.worker_rate).toString()
  store.payload.education = data.education?.id
  store.payload.experience = data.experience?.toString()
  store.payload.region_id = data.city?.region?.id
  store.payload.city_id = data.city?.id
  store._cities(data.city?.region?.id)
}

const changeRegion = (v)=>{
  store.payload.city_id = null
  store._cities(v)
}


onMounted(()=>{
  store._vacancyPositions()
  componentStore._regions()
  componentStore._enums()
})
</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
  >
    <div  style="height:calc(100vh - 120px)" class="overflow-x-hidden overflow-y-auto">
      <div class="grid grid-cols-12">
        <div class="col-span-12">
          <div class="grid grid-cols-12 gap-x-2 border border-surface-line p-4 rounded-2xl border-dashed mb-4 bg-surface-ground">
            <n-form-item
                class="w-full col-span-9"
                :label="$t(`vacancy.form.department_position_id`)"
                path="department_position_id"
                :rule-path="validationRules.rulesNames.requiredNumberField"
            >
              <n-select
                  v-model:value="store.payload.department_position_id"
                  filterable
                  :options="store.vacancyPositions"
                  label-field="name"
                  value-field="id"
                  :render-label="UIHelper.selectRender.label"
                  :render-tag="UIHelper.selectRender.value"
                  :loading="store.positionLoading"
                  @update:value="onSelect"
              />
            </n-form-item>
            <n-form-item
                class="w-full col-span-3"
                :label="$t(`vacancy.form.region_id`)"
                path="region_id"
                :rule-path="validationRules.rulesNames.requiredNumberField"
            >
              <n-select
                  v-model:value="store.payload.region_id"
                  filterable
                  :options="componentStore.regionList"
                  label-field="name"
                  value-field="id"
                  :loading="componentStore.regionLoading"
                  @update:value="changeRegion"
              />
            </n-form-item>
            <n-form-item
                class="w-full col-span-3"
                :label="$t(`vacancy.form.city_id`)"
                path="city_id"
                :rule-path="validationRules.rulesNames.requiredNumberField"
            >
              <n-select
                  :disabled="!store.payload.region_id"
                  v-model:value="store.payload.city_id"
                  filterable
                  :options="store.cityList"
                  label-field="name"
                  value-field="id"
                  :loading="store.cityLoading"
              />
            </n-form-item>
            <n-form-item
                class="w-full col-span-3"
                :label="$t(`vacancy.form.address`)"
                path="address"
                :rule-path="validationRules.rulesNames.requiredStringField"
            >
              <n-input
                  class="w-full"
                  type="text"
                  v-model:value="store.payload.address"
              />
            </n-form-item>
            <n-form-item
                class="w-full col-span-3"
                :label="$t(`vacancy.form.education`)"
                path="education"
                :rule-path="validationRules.rulesNames.requiredNumberField"
            >
              <n-select
                  v-model:value="store.payload.education"
                  filterable
                  :options="componentStore.educationList"
                  label-field="name"
                  value-field="id"
                  :loading="componentStore.enumLoading"
              />
            </n-form-item>
            <n-form-item
                class="w-full col-span-3"
                :label="$t(`vacancy.form.work_type`)"
                path="work_type"
                :rule-path="validationRules.rulesNames.requiredNumberField"
            >
              <n-select
                  v-model:value="store.payload.work_type"
                  filterable
                  :options="componentStore.work_Types"
                  label-field="name"
                  value-field="id"
                  :loading="componentStore.enumLoading"
              />
            </n-form-item>
            <n-form-item
                class="w-full col-span-3"
                :label="$t(`vacancy.form.rate`)"
                path="rate"
                :rule-path="validationRules.rulesNames.requiredStringField"
            >
              <n-input
                  class="w-full"
                  type="text"
                  v-model:value="store.payload.rate"
              />
            </n-form-item>
            <n-form-item
                class="w-full col-span-3"
                :label="$t(`vacancy.form.salary`)"
                path="salary"
                :rule-path="validationRules.rulesNames.requiredStringField"
            >
              <n-input
                  class="w-full"
                  type="text"
                  v-model:value="store.payload.salary"
              />
            </n-form-item>
            <n-form-item
                class="w-full col-span-3"
                :label="$t(`vacancy.form.experience`)"
                path="experience"
                :rule-path="validationRules.rulesNames.requiredStringField"
            >
              <n-input
                  class="w-full"
                  type="text"
                  v-model:value="store.payload.experience"
              />
            </n-form-item>
            <n-form-item
                class="w-full col-span-3"
                :label="$t(`vacancy.form.to`)"
                path="to"
                :rule-path="validationRules.rulesNames.requiredNumberField"
            >
              <n-date-picker
                  class="w-full"
                  v-model:value="store.payload.to"
                  type="date"
                  :format="useAppSetting.datePicketFormat"
              />
            </n-form-item>
          </div>
        </div>
        <div class="col-span-12 border border-dashed border-surface-line p-4 rounded-2xl bg-surface-ground/30 mb-6">
          <div class="grid grid-cols-12">
            <UIEditor
                :label="$t(`vacancy.form.qualification_requirements`)"
                class="col-span-12"
                v-model:text="store.payload.qualification_requirements"
                show-toolbar
                path="qualification_requirements"
                with-validation
                :showValidationMessage="true"
            />
          </div>
          <div class="grid grid-cols-12">
            <UIEditor
                :label="$t(`vacancy.form.position_obligations`)"
                class="col-span-12"
                v-model:text="store.payload.position_obligations"
                show-toolbar
                path="position_obligations"
                with-validation
                :showValidationMessage="true"
            />
          </div>
          <div class="grid grid-cols-12">
            <UIEditor
                :label="$t(`vacancy.form.working_conditions`)"
                class="col-span-12"
                v-model:text="store.payload.working_conditions"
                show-toolbar
                path="working_conditions"
                with-validation
                :showValidationMessage="true"
            />
          </div>
          <div class="grid grid-cols-12">
            <UIEditor
                :label="$t(`vacancy.form.specialties`)"
                class="col-span-12"
                v-model:text="store.payload.specialties"
                show-toolbar
                path="specialties"
                with-validation
                :showValidationMessage="true"
            />
          </div>
        </div>

      </div>


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
  </n-form>
</template>

<style scoped>

</style>