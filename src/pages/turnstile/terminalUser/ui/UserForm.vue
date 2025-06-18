<script setup>
import validationRules from "@/utils/validationRules.js"
import {useComponentStore, useTurnstileTerminalUserStore} from "@/store/modules/index.js"
import {useAppSetting} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import PhoneForm from "@/pages/hrm/condidate/ui/PhoneForm.vue"
import PhotoForm from "@/pages/hrm/condidate/ui/PhotoForm.vue"

const store = useTurnstileTerminalUserStore()
const componentStore = useComponentStore()
const formRef = ref(null)

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveUser()
    }
  })
}



onMounted(()=>{
  componentStore._countries()
  componentStore._enums()
  componentStore._regions()
  componentStore._nationality()
})
</script>

<template>
  <div class="w-full h-[calc(100vh-200px)] overflow-y-auto">
    <n-form
        class="w-full grid-cols-12 grid gap-4"
        ref="formRef"
        :rules="validationRules.common"
        :model="store.userPayload"
    >
      <PhotoForm
          class="col-span-12"
          v-model:images="store.userPayload.photos"
          v-model:main-image-id="store.mainImageId"
          @onDelete="store.onDeletePhoto"
      />
      <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`createWorkerPage.form.lastName`)"
          :rule-path="validationRules.rulesNames.requiredStringField"
          path="last_name">
        <n-input
            class="w-full"
            type="text"

            v-model:value="store.userPayload.last_name"
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

            v-model:value="store.userPayload.first_name"
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

            v-model:value="store.userPayload.middle_name"
        />
      </n-form-item>
      <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`createWorkerPage.form.country`)"
          :rule-path="validationRules.rulesNames.requiredNumberField"
          path="country_id">
        <n-select
            v-model:value="store.userPayload.country_id"
            filterable
            :options="componentStore.countryList"
            label-field="name"
            value-field="id"
            :loading="componentStore.countryLoading"
        />
      </n-form-item>
      <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`createWorkerPage.form.region`)"
          :rule-path="validationRules.rulesNames.requiredNumberField"
          path="region_id">
        <n-select
            v-model:value="store.userPayload.region_id"
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
            :disabled="!store.userPayload.region_id"
            v-model:value="store.userPayload.city_id"
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
            v-model:value="store.userPayload.current_region_id"
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
            :disabled="!store.userPayload.current_region_id"
            v-model:value="store.userPayload.current_city_id"
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
            v-model:value="store.userPayload.birthday"
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
            v-model:value="store.userPayload.address"
        />
      </n-form-item>
      <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`createWorkerPage.form.nationality_id`)"
          :rule-path="validationRules.rulesNames.requiredNumberField"
          path="nationality_id">
        <n-select
            v-model:value="store.userPayload.nationality_id"
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
            v-model:value="store.userPayload.sex"
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

            v-model:value="store.userPayload.pin"
            v-mask="`####-####-####-##`"
        />
      </n-form-item>
      <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`createWorkerPage.form.marital_status`)"
          :rule-path="validationRules.rulesNames.requiredNumberField"
          path="marital_status">
        <n-select
            v-model:value="store.userPayload.marital_status"
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

            v-model:value="store.userPayload.work_experience"
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
            v-model:value="store.userPayload.experience_date"
            type="date"

            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
      <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`createWorkerPage.form.education`)"
          :rule-path="validationRules.rulesNames.requiredNumberField"
          path="education">
        <n-select
            v-model:value="store.userPayload.education"
            :rule-path="validationRules.rulesNames.requiredNumberField"
            filterable
            clearable
            :options="componentStore.educationList"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
        />
      </n-form-item>
      <PhoneForm
          class="col-span-12"
          v-model:phones="store.userPayload.phones"
      />
    </n-form>
  </div>
  <div class="flex gap-4">
    <n-button
        :loading="store.userLoading"
        class="!w-1/2"
        @click="store.addVisible = false" type="error" ghost>
      {{ $t('content.cancel') }}
    </n-button>
    <n-button
        class="!w-1/2"
        :loading="store.userLoading"
        type="primary"
        @click="onSubmit">
      {{ $t('content.save') }}
    </n-button>
  </div>


</template>
