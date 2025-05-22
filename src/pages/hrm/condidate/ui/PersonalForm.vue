<script setup>
import {useComponentStore, useCreateWorkerStore} from "@/store/modules/index.js"
import validationRules from "@/utils/validationRules.js"
import Utils from "@/utils/Utils.js"
import {useAppSetting} from "@/utils/index.js"
const store = useCreateWorkerStore()
const componentStore = useComponentStore()
const formRef = ref(null)

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      store.save()
    }
  })
}

const changeCountry = ()=>{
  componentStore.regionList = []
  store.payload.region_id = null
  store.payload.city_id = null
  store.payload.current_region_id = null
  store.payload.current_city_id = null
  componentStore._regions(store.payload.country_id)
}

defineExpose({
  onSubmit
})

onMounted(()=>{
  componentStore._countries()
  componentStore._enums()
  componentStore._regions(1)
  componentStore._nationality()
})
</script>

<template>
  <div class="grid-cols-12 grid w-full gap-x-2">
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.lastName`)"
        :rule-path="validationRules.rulesNames.requiredStringField"
        path="last_name">
      <n-input
          class="w-full"
          type="text"

          v-model:value="store.payload.last_name"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.firstName`)"
        :rule-path="validationRules.rulesNames.requiredStringField"
        path="first_name">
      <n-input
          class="w-full"
          type="text"

          v-model:value="store.payload.first_name"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.middleName`)"
        :rule-path="validationRules.rulesNames.requiredStringField"
        path="middle_name">
      <n-input
          class="w-full"
          type="text"

          v-model:value="store.payload.middle_name"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.country`)"
        :rule-path="validationRules.rulesNames.requiredNumberField"
        path="country_id">
      <n-select
          v-model:value="store.payload.country_id"
          filterable

          :options="componentStore.countryList"
          label-field="name"
          value-field="id"
          :loading="componentStore.countryLoading"
          @update:value="changeCountry"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.region`)"
        :rule-path="validationRules.rulesNames.requiredNumberField"
        path="region_id">
      <n-select
          v-model:value="store.payload.region_id"
          @update:value="store.changeRegion"
          filterable

          :options="componentStore.regionList"
          label-field="name"
          value-field="id"
          :loading="componentStore.regionLoading"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.city`)"
        :rule-path="validationRules.rulesNames.requiredNumberField"
        path="city_id">
      <n-select
          :disabled="!store.payload.region_id"
          v-model:value="store.payload.city_id"
          filterable

          :options="store.districtList"
          label-field="name"
          value-field="id"
          :loading="store.districtLoading"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.currentRegion`)"
        :rule-path="validationRules.rulesNames.requiredNumberField"
        path="current_region_id">
      <n-select
          v-model:value="store.payload.current_region_id"
          @update:value="store.changeCurrentRegion"
          filterable

          :options="componentStore.regionList"
          label-field="name"
          value-field="id"
          :loading="componentStore.regionLoading"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.currentCity`)"
        :rule-path="validationRules.rulesNames.requiredNumberField"
        path="current_city_id">
      <n-select
          :disabled="!store.payload.current_region_id"
          v-model:value="store.payload.current_city_id"
          filterable

          :options="store.currentDistrictList"
          label-field="name"
          value-field="id"
          :loading="store.currentDistrictLoading"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.birthday`)"
        :rule-path="validationRules.rulesNames.requiredDateTimeField"
        path="birthday">
      <n-date-picker
          class="w-full"
          v-model:value="store.payload.birthday"
          type="date"

          :format="useAppSetting.datePicketFormat"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.address`)"
        :rule-path="validationRules.rulesNames.requiredStringField"
        path="address">
      <n-input
          class="w-full"
          type="text"

          v-model:value="store.payload.address"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.nationality_id`)"
        :rule-path="validationRules.rulesNames.requiredNumberField"
        path="nationality_id">
      <n-select
          v-model:value="store.payload.nationality_id"
          filterable

          :options="componentStore.nationalityList"
          label-field="name"
          value-field="id"
          :loading="componentStore.nationalityLoading"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.sex`)"
        :rule-path="validationRules.rulesNames.requiredNumberField"
        path="sex">
      <n-select
          v-model:value="store.payload.sex"
          filterable

          :options="componentStore.genderList"
          label-field="name"
          value-field="id"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.pin`)"
        :rule-path="validationRules.rulesNames.requiredPinField"
        path="pin">
      <n-input
          class="w-full"
          type="text"

          v-model:value="store.payload.pin"
          v-mask="`####-####-####-##`"
      />
    </n-form-item>
<!--    <n-form-item-->
<!--        class="col-span-12 md:col-span-6 lg:col-span-4"-->
<!--        :label="$t(`createWorkerPage.form.inn`)"-->
<!--        path="inn">-->
<!--      <n-input-->
<!--          class="w-full"-->
<!--          type="text"-->
<!--          v-mask="`#########`"-->
<!--          -->
<!--          v-model:value="store.payload.inn"-->
<!--          :allow-input="Utils.onlyAllowNumber"-->
<!--      />-->
<!--    </n-form-item>-->
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.marital_status`)"
        :rule-path="validationRules.rulesNames.requiredNumberField"
        path="marital_status">
      <n-select
          v-model:value="store.payload.marital_status"
          :rule-path="validationRules.rulesNames.requiredNumberField"
          filterable

          :options="componentStore.maritalList"
          label-field="name"
          value-field="id"
          :loading="componentStore.enumLoading"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.work_experience`)"
        :rule-path="validationRules.rulesNames.requiredStringField"
        path="work_experience">
      <n-input
          class="w-full"
          type="text"

          v-model:value="store.payload.work_experience"
          :allow-input="Utils.onlyAllowNumber"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.experience_date`)"
        :rule-path="validationRules.rulesNames.requiredDateTimeField"
        path="experience_date">
      <n-date-picker
          class="w-full"
          v-model:value="store.payload.experience_date"
          type="date"

          :format="useAppSetting.datePicketFormat"
      />
    </n-form-item>



  </div>

</template>

<style scoped>

</style>