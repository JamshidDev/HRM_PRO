<script setup>
import {useApplicationStore, useComponentStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import Signature from "./Signature.vue"
import validationRules from "@/utils/validationRules.js"
import PhoneForm from "@/pages/hrm/condidate/ui/PhoneForm.vue"
import {useRoute} from "vue-router"

const store = useApplicationStore()
const componentStore = useComponentStore()
const route = useRoute()
const formRef = ref(null)
const signatureRef = ref(null)

const onCountry = ()=>{
  if(componentStore.countryList.length === 0){
    componentStore._countries()
  }
}

const onNationality= ()=>{
  if(componentStore.nationalityList.length === 0){
    componentStore._nationality()
  }
}

const onRegion= ()=>{
  if(componentStore.regionList.length === 0){
    componentStore._regions()
  }
}

const onSubmit = (data)=>{
  store.form.key = data
  formRef.value?.validate((error)=>{
    if(!error && store.form.key){
      const params = route?.query
      store.saveLoading = true
      store._sendApp(params)
    }
  })
}
onMounted(()=>{
componentStore._enums()
  store._checkApplication(route.query)
})
</script>

<template>
  <div class="w-full max-w-[1440px] mx-auto overflow-auto flex flex-col">
    <template v-if="store.applicationData">
      <n-form
          ref="formRef"
          :rules="validationRules.applicationForm"
          :model="store.form"
          class="grid grid-cols-12 gap-x-4 bg-white p-6 rounded-lg"
      >
        <div class="col-span-12 mb-10">
          <h2 class="text-center text-3xl font-bold uppercase mt-4 text-primary">{{$t('applicationPage.client.name')}}</h2>
        </div>
        <div class="col-span-12">
          <div class="grid grid-cols-12 border border-surface-line rounded-md border-dashed p-4 mb-16">
            <div class="col-span-6">
              <h3 class="text-gray-400">{{$t('applicationPage.client.type')}}</h3>
              <h3 class="font-semibold">{{store.applicationData?.type.name}}</h3>
            </div>
            <div class="col-span-6">
              <h3 class="text-gray-400 text-end">{{$t('applicationPage.client.user')}}</h3>
              <div class="flex justify-end">
                {{Utils.combineFullName(store.applicationData?.director?.worker)}}
              </div>

            </div>
          </div>
        </div>
        <n-form-item
            class="col-span-4"
            :label="$t(`createWorkerPage.form.lastName`)"
            path="last_name">
          <n-input
              class="w-full"
              type="text"

              v-model:value="store.form.last_name"
          />
        </n-form-item>
        <n-form-item
            class="col-span-4"
            :label="$t(`createWorkerPage.form.firstName`)"
            path="first_name">
          <n-input
              class="w-full"
              type="text"

              v-model:value="store.form.first_name"
          />
        </n-form-item>
        <n-form-item
            class="col-span-4"
            :label="$t(`createWorkerPage.form.middleName`)"
            path="middle_name">
          <n-input
              class="w-full"
              type="text"

              v-model:value="store.form.middle_name"
          />
        </n-form-item>
        <n-form-item
            class="col-span-4"
            :label="$t(`createWorkerPage.form.country`)"
            path="country_id">
          <n-select
              @focus="onCountry"
              v-model:value="store.form.country_id"
              filterable

              :options="componentStore.countryList"
              label-field="name"
              value-field="id"
              :loading="componentStore.countryLoading"
          />
        </n-form-item>
        <n-form-item
            class="col-span-4"
            :label="$t(`createWorkerPage.form.region`)"
            path="region_id">
          <n-select
              @focus="onRegion"
              v-model:value="store.form.region_id"
              @update:value="store._getCity"
              filterable

              :options="componentStore.regionList"
              label-field="name"
              value-field="id"
              :loading="componentStore.regionLoading"
          />
        </n-form-item>
        <n-form-item
            class="col-span-4"
            :label="$t(`createWorkerPage.form.city`)"
            path="city_id">
          <n-select
              :disabled="!store.form.region_id"
              v-model:value="store.form.city_id"
              filterable

              :options="store.cityList"
              label-field="name"
              value-field="id"
              :loading="store.cityLoading"
          />
        </n-form-item>
        <n-form-item
            class="col-span-4"
            :label="$t(`createWorkerPage.form.currentRegion`)"
            path="current_region_id">
          <n-select
              @focus="onRegion"
              v-model:value="store.form.current_region_id"
              @update:value="store._getLiveCity"
              filterable

              :options="componentStore.regionList"
              label-field="name"
              value-field="id"
              :loading="componentStore.regionLoading"
          />
        </n-form-item>
        <n-form-item
            class="col-span-4"
            :label="$t(`createWorkerPage.form.currentCity`)"
            path="current_city_id">
          <n-select
              :disabled="!store.form.current_region_id"
              v-model:value="store.form.current_city_id"
              filterable

              :options="store.liveCityList"
              label-field="name"
              value-field="id"
              :loading="store.liveCityLoading"
          />
        </n-form-item>
        <n-form-item
            class="col-span-4"
            :label="$t(`createWorkerPage.form.birthday`)"
            path="birthday">
          <n-date-picker
              class="w-full"
              v-model:value="store.form.birthday"
              type="date"

              format="yyyy/MM/dd"
          />
        </n-form-item>
        <n-form-item
            class="col-span-4"
            :label="$t(`createWorkerPage.form.address`)"
            path="address">
          <n-input
              class="w-full"
              type="text"

              v-model:value="store.form.address"
          />
        </n-form-item>
        <n-form-item
            class="col-span-4"
            :label="$t(`createWorkerPage.form.nationality_id`)"
            path="nationality_id">
          <n-select
              @focus="onNationality"
              v-model:value="store.form.nationality_id"
              filterable

              :options="componentStore.nationalityList"
              label-field="name"
              value-field="id"
              :loading="componentStore.nationalityLoading"
          />
        </n-form-item>
        <n-form-item
            class="col-span-4"
            :label="$t(`createWorkerPage.form.pin`)"
            path="pin">
          <n-input
              class="w-full"
              type="text"

              v-model:value="store.form.pin"
              v-mask="`####-####-####-##`"
          />
        </n-form-item>
        <n-form-item
            class="col-span-4"
            :label="$t(`createWorkerPage.form.inn`)"
            path="inn">
          <n-input
              class="w-full"
              type="text"
              v-mask="`#########`"

              v-model:value="store.form.inn"
              :allow-input="Utils.onlyAllowNumber"
          />
        </n-form-item>
        <n-form-item
            class="col-span-4"
            :label="$t(`createWorkerPage.form.marital_status`)"
            path="marital_status">
          <n-select
              v-model:value="store.form.marital_status"
              filterable

              :options="componentStore.maritalList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
          />
        </n-form-item>
       <div class="col-span-12">
         <span class="block mb-1">{{$t('applicationPage.form.phones')}}</span>
         <PhoneForm
             :phones="store.form.phones"
         />
       </div>

        <div class="col-span-12 p-6">
          <Signature
              @on-submit="onSubmit"
              ref="signatureRef"
              :is-check="true"
          />
        </div>
      </n-form>
    </template>
  </div>
</template>