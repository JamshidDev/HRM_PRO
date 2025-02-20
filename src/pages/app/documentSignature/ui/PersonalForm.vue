<script setup>
import {useApplicationStore, useComponentStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useApplicationStore()
const componentStore = useComponentStore()
</script>

<template>
  <div class="w-full flex flex-col">
    <div class="max-w-[] grid grid-cols-12 gap-x-4 bg-white p-6 rounded-lg">
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
            v-model:value="store.form.region_id"
            @update:value="store.changeRegion"
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
            :options="store.districtList"
            label-field="name"
            value-field="id"
            :loading="store.districtLoading"
        />
      </n-form-item>
      <n-form-item
          class="col-span-4"
          :label="$t(`createWorkerPage.form.currentRegion`)"
          path="current_region_id">
        <n-select
            v-model:value="store.form.current_region_id"
            @update:value="store.changeCurrentRegion"
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
            :options="store.currentDistrictList"
            label-field="name"
            value-field="id"
            :loading="store.currentDistrictLoading"
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
  </div>

</template>

<style scoped>

</style>