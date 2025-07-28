<script setup>
import validationRules from "@/utils/validationRules.js"
import {useComponentStore, usePensionerStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import i18n from "@/i18n/index.js"

const {t} = i18n.global


const store = usePensionerStore()
const componentStore = useComponentStore()
const formRef = ref(null)

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){x
      const data = {
        ...store.payload,
        phone:store.payload.phone.replace(/-/g,''),
        pin:store.payload.pin.replace(/-/g,'').replace(')','').replace('(',''),
        afghan:Boolean(store.payload.afghan),
        chernobyl:Boolean(store.payload.chernobyl),
        railway_title:Boolean(store.payload.railway_title),
        invalid:Boolean(store.payload.invalid),
        sex:Boolean(store.payload.sex),
        year:new Date(store.payload.year).getFullYear(),
      }
      if(store.visibleType){
        store._create(data)
      }else{
        store._update(data)
      }
    }
  })
}

const yesOrNoList = [
  {
    name:t('content.yes'),
    id:1,
  },
  {
    name:t('content.no'),
    id:0,
  },
]

</script>

<template>
  <div class="w-full h-[calc(100vh-200px)] overflow-y-auto">
    <n-form
        class="w-full grid-cols-12 grid gap-4"
        ref="formRef"
        :rules="validationRules.common"
        :model="store.payload"
    >
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
          class="col-span-12 md:col-span-6 lg:col-span-8"
          :label="$t(`pensioner.form.position`)"
          :rule-path="validationRules.rulesNames.requiredStringField"
          path="position">
        <n-input
            class="w-full"
            type="text"
            v-model:value="store.payload.position"
        />
      </n-form-item>

      <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`pensioner.form.passport`)"
          :rule-path="validationRules.rulesNames.requiredStringField"
          path="passport">
        <n-input
            class="w-full"
            type="text"
            v-mask="`AA#######`"
            v-model:value="store.payload.passport"
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
      <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`pensioner.form.address`)"
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
          :label="$t(`pensioner.form.experience`)"
          :rule-path="validationRules.rulesNames.requiredStringField"
          path="experience">
        <n-input
            class="w-full"
            type="text"
            v-model:value="store.payload.experience"
            :allow-input="Utils.onlyAllowNumber"
        />
      </n-form-item>
      <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`pensioner.form.year`)"
          :rule-path="validationRules.rulesNames.requiredDateTimeField"
          path="year">
        <n-date-picker
            class="w-full disable-mask"
            v-model:value="store.payload.year"
            type="year"
        />
      </n-form-item>
      <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`pensioner.form.phone`)"
          :rule-path="validationRules.rulesNames.requiredStringField"
          path="phone">
        <n-input
            class="w-full"
            type="text"
            v-mask="'(##)-###-##-##'"
            placeholder="(##)-###-##-##"
            v-model:value="store.payload.phone"
        />
      </n-form-item>

      <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-6"
          :label="$t(`pensioner.form.invalid`)"
          :rule-path="validationRules.rulesNames.requiredNumberField"
          path="invalid">
        <n-select
            v-model:value="store.payload.invalid"
            filterable
            :options="yesOrNoList"
            label-field="name"
            value-field="id"
        />
      </n-form-item>
      <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-6"
          :label="$t(`pensioner.form.railway_title`)"
          :rule-path="validationRules.rulesNames.requiredNumberField"
          path="railway_title">
        <n-select
            v-model:value="store.payload.railway_title"
            filterable
            :options="yesOrNoList"
            label-field="name"
            value-field="id"
        />
      </n-form-item>
      <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-6"
          :label="$t(`pensioner.form.afghan`)"
          :rule-path="validationRules.rulesNames.requiredNumberField"
          path="afghan">
        <n-select
            v-model:value="store.payload.afghan"
            filterable
            :options="yesOrNoList"
            label-field="name"
            value-field="id"
        />
      </n-form-item>
      <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-6"
          :label="$t(`pensioner.form.chernobyl`)"
          :rule-path="validationRules.rulesNames.requiredNumberField"
          path="chernobyl">
        <n-select
            v-model:value="store.payload.chernobyl"
            filterable
            :options="yesOrNoList"
            label-field="name"
            value-field="id"
        />
      </n-form-item>

    </n-form>
  </div>
  <div class="flex gap-4">
    <n-button
        :loading="store.saveLoading"
        class="!w-1/2"
        @click="store.addVisible = false" type="error" ghost>
      {{ $t('content.cancel') }}
    </n-button>
    <n-button
        class="!w-1/2"
        :loading="store.saveLoading"
        type="primary"
        @click="onSubmit">
      {{ $t('content.save') }}
    </n-button>
  </div>


</template>
