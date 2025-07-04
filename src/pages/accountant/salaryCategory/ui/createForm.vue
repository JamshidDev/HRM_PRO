<script setup>
import {useSalaryCategoryStore} from "@/store/modules/index.js"
import validationRules from "@/utils/validationRules.js"
import Utils from "@/utils/Utils.js"

const store = useSalaryCategoryStore()
const formRef = ref(null)

const onSubmit = ()=>{
  // formRef.value?.validate((error)=>{
  //   if(!error){
  //
  //   }
  // })
  const data = store.payload
  if(store.visibleType){
    store._create(data)
  }else{
    store._update(data)
  }
}

const filterEvent = ()=>{

}

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
  >
    <div class="h-[calc(100vh-160px)] overflow-y-auto">
      <div class="grid grid-cols-12">
        <div class="col-span-12 flex justify-center gap-4 mb-6">
          <n-select
              class="w-full! md:w-[200px]!"
              v-model:value="store.payload.year"
              :options="Utils.yearList"
              label-field="name"
              value-field="id"
              @update:value="filterEvent"
          />
          <n-select
              class="w-full! md:w-[200px]!"
              v-model:value="store.payload.month"
              :options="Utils.monthList"
              label-field="name"
              value-field="id"
              @update:value="filterEvent"
          />
        </div>
      </div>

      <div class="grid grid-cols-12 gap-x-2 border border-dashed border-surface-line rounded-2xl p-2 pb-0 mb-4">
        <p class="col-span-12 font-semibold pb-2">{{$t('salaryCategory.label.external')}}</p>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.external_worker_count`)"
            path="external_worker_count"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.external_worker_count"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.external_salary_fund`)"
            path="external_salary_fund"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.external_salary_fund"
          />
        </n-form-item>
      </div>

      <div class="grid grid-cols-12 gap-x-2 border border-dashed border-surface-line rounded-2xl p-2 pb-0 mb-4">
        <p class="col-span-12 font-semibold pb-2">{{$t('salaryCategory.label.capital')}}</p>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.capital_society_worker_count`)"
            path="capital_society_worker_count"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.capital_society_worker_count"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.capital_society_salary_fund`)"
            path="capital_society_salary_fund"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.capital_society_salary_fund"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.capital_own_use_worker_count`)"
            path="capital_own_use_worker_count"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.capital_own_use_worker_count"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.capital_own_use_salary_fund`)"
            path="capital_own_use_salary_fund"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.capital_own_use_salary_fund"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.capital_foreign_company_worker_count`)"
            path="capital_foreign_company_worker_count"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.capital_foreign_company_worker_count"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.capital_foreign_company_salary_fund`)"
            path="capital_foreign_company_salary_fund"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.capital_foreign_company_salary_fund"
          />
        </n-form-item>
      </div>

      <div class="grid grid-cols-12 gap-x-2 border border-dashed border-surface-line rounded-2xl p-2 pb-0 mb-4">
        <p class="col-span-12 font-semibold pb-2">{{$t('salaryCategory.label.construction')}}</p>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.construction_society_worker_count`)"
            path="construction_society_worker_count"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.construction_society_worker_count"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.construction_society_salary_fund`)"
            path="construction_society_salary_fund"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.construction_society_salary_fund"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.construction_own_use_worker_count`)"
            path="construction_own_use_worker_count"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.construction_own_use_worker_count"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.construction_own_use_salary_fund`)"
            path="construction_own_use_salary_fund"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.construction_own_use_salary_fund"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.construction_foreign_company_worker_count`)"
            path="construction_foreign_company_worker_count"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.construction_foreign_company_worker_count"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.construction_foreign_company_salary_fund`)"
            path="construction_foreign_company_salary_fund"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.construction_foreign_company_salary_fund"
          />
        </n-form-item>
      </div>

      <div class="grid grid-cols-12 gap-x-2 border border-dashed border-surface-line rounded-2xl p-2 pb-0 mb-4">
        <p class="col-span-12 font-semibold pb-2">{{$t('salaryCategory.label.other')}}</p>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.other_own_use_worker_count`)"
            path="other_own_use_worker_count"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.other_own_use_worker_count"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.other_own_use_salary_fund`)"
            path="other_own_use_salary_fund"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.other_own_use_salary_fund"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.other_foreign_company_worker_count`)"
            path="other_foreign_company_worker_count"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.other_foreign_company_worker_count"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.other_foreign_company_salary_fund`)"
            path="other_foreign_company_salary_fund"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.other_foreign_company_salary_fund"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.other_society_worker_count`)"
            path="other_society_worker_count"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.other_society_worker_count"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.other_society_salary_fund`)"
            path="other_society_salary_fund"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.other_society_salary_fund"
          />
        </n-form-item>


      </div>

      <div class="grid grid-cols-12 gap-x-2 border border-dashed border-surface-line rounded-2xl p-2 pb-0 mb-10">
        <p class="col-span-12 font-semibold pb-2">{{$t('salaryCategory.label.fromIt')}}</p>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.temporary_contract_worker_count`)"
            path="temporary_contract_worker_count"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.temporary_contract_worker_count"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.temporary_contract_salary_fund`)"
            path="temporary_contract_salary_fund"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.temporary_contract_salary_fund"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.civil_contract_worker_count`)"
            path="civil_contract_worker_count"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.civil_contract_worker_count"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.civil_contract_salary_fund`)"
            path="civil_contract_salary_fund"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.civil_contract_salary_fund"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.freelancer_worker_count`)"
            path="freelancer_worker_count"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.freelancer_worker_count"
          />
        </n-form-item>
        <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-3"
            :label="$t(`salaryCategory.form.freelancer_salary_fund`)"
            path="freelancer_salary_fund"
            :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
              v-model:value="store.payload.freelancer_salary_fund"
          />
        </n-form-item>
      </div>

    </div>


    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{$t('content.cancel')}}
      </n-button>
      <n-button
          @click="onSubmit"
          :loading="store.saveLoading"
          type="primary">
        {{$t('content.save')}}
      </n-button>
    </div>
  </n-form>
</template>
