<script setup>
import {useApplicationStore, useComponentStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import Signature from "./Signature.vue"
import {useRoute} from "vue-router"

const store = useApplicationStore()
const componentStore = useComponentStore()
const route = useRoute()

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
onMounted(()=>{
componentStore._enums()
  store._checkApplication(route.query)
})
</script>

<template>
  <div class="w-full max-w-[1440px] mx-auto overflow-auto flex flex-col">
    <div class="grid grid-cols-12 gap-x-4 bg-white p-6 rounded-lg">
      <n-form-item
          class="col-span-4"
          :label="$t(`createWorkerPage.form.lastName`)"
          path="last_name">
        <n-input
            class="w-full"
            type="text"
            :placeholder="$t(`content.enterField`)"
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
            :placeholder="$t(`content.enterField`)"
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
            :placeholder="$t(`content.enterField`)"
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
            :placeholder="$t(`content.choose`)"
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
            :placeholder="$t(`content.choose`)"
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
            :placeholder="$t(`content.choose`)"
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
            :placeholder="$t(`content.choose`)"
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
            :placeholder="$t(`content.choose`)"
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
            :placeholder="$t(`content.choose`)"
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
            :placeholder="$t(`content.enterField`)"
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
            :placeholder="$t(`content.choose`)"
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
            :placeholder="$t(`content.enterField`)"
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
            :placeholder="$t(`content.enterField`)"
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
            :placeholder="$t(`content.choose`)"
            :options="componentStore.maritalList"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
        />
      </n-form-item>
    </div>
    <div class="grid grid-cols-12 bg-white p-6 rounded-lg">
      <div class="col-span-12">
        <Signature/>
      </div>

    </div>

  </div>

</template>

<style scoped>

</style>