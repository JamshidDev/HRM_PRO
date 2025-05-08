<script setup>
import {useWorkerProfileStore, useComponentStore} from "@/store/modules/index.js"
import validationRules from "@/utils/validationRules.js"
import Utils from "@/utils/Utils.js"
import PhotoForm from "@/pages/hrm/condidate/ui/PhotoForm.vue"
import PhoneForm from "@/pages/hrm/condidate/ui/PhoneForm.vue"
import PassportForm from "../ui/PasportList.vue"
import PositionList from "../ui/PositionList.vue"
import RolesList from "../ui/RolesList.vue"
import {useRoute} from "vue-router"
import {useAppSetting} from "@/utils/index.js"
const route = useRoute()
const store = useWorkerProfileStore()
const componentStore = useComponentStore()
const formRef = ref(null)

const onDelete = (v)=>{
  if(v.id.toString().length>10){
    store.photos = store.photos.filter((x)=>x.id !== v.id )
  }else{
    store._deletePhoto(v.id)
  }
}

const onDeletePhone = (v)=>{
  if(v.exist){
    store._deletePhone(v.id)
  }
}

const onCountry = ()=>{
  if(componentStore.countryList.length<2){
    componentStore._countries()
  }
}

const onRegion = ()=>{
  if(componentStore.regionList.length<3){
    componentStore._regions()
  }
}

const onDistrict = ()=>{
  if(store.districts.length<2){
    store._district()
  }
}

const changeDistrict = ()=>{
  store.payload.city_id = null
  store.districts = []
  store._district()
}

const onCurrentDistrict = ()=>{
  if(store.currentDistricts.length<2){
    store._currentDistrict()
  }
}

const changeCurrentDistrict = ()=>{
  store.payload.current_city_id = null
  store.currentDistricts = []
}

const onNationality = ()=>{
  componentStore._nationality()
}

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      store.savePersonalInfo()
    }
  })
}

onMounted(()=>{
  store.elementId = route.query.id
  store._index()
  store._indexPassport()
  componentStore._enums()
  componentStore._nationality()
})

</script>

<template>
  <n-form
      class="w-full grid grid-cols-12 gap-x-4 px-2"
      ref="formRef"
      :rules="validationRules.workerProfileForm"
      :model="store.payload"
  >
    <div class="col-span-12">
      <PhotoForm
          v-model:images="store.photos"
          v-model:main-image-id="store.mainImgId"
          @onDelete="onDelete"
      />
    </div>
    <div class="col-span-12 flex flex-col">
      <div class="flex justify-between items-end">
        <span class="text-xs text-gray-400">{{$t('createWorkerPage.ui.image')}}</span>
        <n-button
            type="info"
            class="ml-auto px-10"
            @click="store.savePhoto(route.query.id)"
            :loading="store.loading"
        >{{$t(`content.save`)}}</n-button>
      </div>
      <div class="w-full border-b mt-2 mb-10 border-dashed border-surface-line"></div>
    </div>
    <n-form-item
        class="w-full col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.lastName`)"
        path="last_name">
      <n-input
          class="w-full"
          type="text"
          :placeholder="$t(`content.enterField`)"
          v-model:value="store.payload.last_name"
      />
    </n-form-item>
    <n-form-item
        class="w-full col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.firstName`)"
        path="first_name">
      <n-input
          class="w-full"
          type="text"
          :placeholder="$t(`content.enterField`)"
          v-model:value="store.payload.first_name"
      />
    </n-form-item>
    <n-form-item
        class="w-full col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.middleName`)"
        path="middle_name">
      <n-input
          class="w-full"
          type="text"
          :placeholder="$t(`content.enterField`)"
          v-model:value="store.payload.middle_name"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.birthday`)"
        path="birthday">
      <n-date-picker
          class="w-full"
          v-model:value="store.payload.birthday"
          type="date"
          :placeholder="$t(`content.choose`)"
          :format="useAppSetting.datePicketFormat"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.country`)"
        path="country_id">
      <n-select
          v-model:value="store.payload.country_id"
          @focus="onCountry"
          filterable
          :placeholder="$t(`content.choose`)"
          :options="componentStore.countryList"
          label-field="name"
          value-field="id"
          :loading="componentStore.countryLoading"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.region`)"
        path="region_id">
      <n-select
          @focus="onRegion"
          v-model:value="store.payload.region_id"
          @updateValue="changeDistrict"
          filterable
          :placeholder="$t(`content.choose`)"
          :options="componentStore.regionList"
          label-field="name"
          value-field="id"
          :loading="componentStore.regionLoading"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.city`)"
        path="city_id">
      <n-select
          @focus="onDistrict"
          v-model:value="store.payload.city_id"
          filterable
          :placeholder="$t(`content.choose`)"
          :options="store.districts"
          label-field="name"
          value-field="id"
          :loading="store.districtLoading"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.currentRegion`)"
        path="current_region_id">
      <n-select
          @focus="onRegion"
          v-model:value="store.payload.current_region_id"
          @updateValue="changeCurrentDistrict"
          filterable
          :placeholder="$t(`content.choose`)"
          :options="componentStore.regionList"
          label-field="name"
          value-field="id"
          :loading="componentStore.regionLoading"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.currentCity`)"
        path="current_city_id">
      <n-select
          @focus="onCurrentDistrict"
          v-model:value="store.payload.current_city_id"
          filterable
          :placeholder="$t(`content.choose`)"
          :options="store.currentDistricts"
          label-field="name"
          value-field="id"
          :loading="store.currentDistrictLoading"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.address`)"
        path="address">
      <n-input
          class="w-full"
          type="text"
          :placeholder="$t(`content.enterField`)"
          v-model:value="store.payload.address"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.nationality_id`)"
        path="nationality_id">
      <n-select
          @focus="onNationality"
          v-model:value="store.payload.nationality_id"
          filterable
          :placeholder="$t(`content.choose`)"
          :options="componentStore.nationalityList"
          label-field="name"
          value-field="id"
          :loading="componentStore.nationalityLoading"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.sex_id`)"
        path="sex">
      <n-select
          @focus="onNationality"
          v-model:value="store.payload.sex"
          filterable
          :placeholder="$t(`content.choose`)"
          :options="componentStore.genderList"
          label-field="name"
          value-field="id"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.pin`)"
        path="pin">
      <n-input
          class="w-full"
          type="text"
          :placeholder="$t(`content.enterField`)"
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
<!--          :placeholder="$t(`content.enterField`)"-->
<!--          v-mask="`#########`"-->
<!--          v-model:value="store.payload.inn"-->
<!--          :allow-input="Utils.onlyAllowNumber"-->
<!--      />-->
<!--    </n-form-item>-->
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.marital_status`)"
        path="marital_status">
      <n-select
          v-model:value="store.payload.marital_status"
          filterable
          :placeholder="$t(`content.choose`)"
          :options="componentStore.maritalList"
          label-field="name"
          value-field="id"
          :loading="componentStore.enumLoading"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.work_experience`)"
        path="work_experience">
      <n-input
          class="w-full"
          type="text"
          :placeholder="$t(`content.enterField`)"
          v-model:value="store.payload.work_experience"
          :allow-input="Utils.onlyAllowNumber"
      />
    </n-form-item>
    <n-form-item
        class="col-span-12 md:col-span-6 lg:col-span-4"
        :label="$t(`createWorkerPage.form.experience_date`)"
        path="birthday">
      <n-date-picker
          class="w-full"
          v-model:value="store.payload.experience_date"
          type="date"
          :placeholder="$t(`content.choose`)"
          :format="useAppSetting.datePicketFormat"
      />
    </n-form-item>




    <div class="col-span-12 mt-10">
      <PhoneForm
          @onDelete="onDeletePhone"
          v-model:phones="store.payload.phones"/>
    </div>
    <div class="col-span-12 flex flex-col">
      <div class="flex justify-between items-end">
        <span class="text-xs text-gray-400">{{$t('createWorkerPage.ui.phone')}}</span>
        <n-button
            type="info"
            class="ml-auto px-10"
            @click="onSubmit"
            :loading="store.loading"
        >{{$t(`content.save`)}}</n-button>
      </div>
      <div class="w-full border-b mt-2 mb-10 border-dashed border-surface-line"></div>
    </div>
    <div class="col-span-12 mb-4 mt-16">
      <RolesList/>
    </div>
    <div class="col-span-12 mb-4 mt-16">
      <PositionList/>
    </div>
    <div class="col-span-12">
      <PassportForm/>
    </div>
  </n-form>
<div class="grid grid-cols-12">

</div>
</template>