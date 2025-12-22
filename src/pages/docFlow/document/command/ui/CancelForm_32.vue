<script setup>
import {useCommandStore, useComponentStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import validationRules from "@/utils/validationRules.js"
import i18n from "@/i18n/index.js"
import {useAppSetting} from "@/utils/index.js"
import LastVacationItem from "@/pages/docFlow/document/command/ui/LastVacationItem.vue"
import {Eye24Regular} from "@vicons/fluent"

const store = useCommandStore()
const componentStore = useComponentStore()
const formRef = ref(null)
const lastVacationRef = ref(null)
const lastVacationRef2 = ref(null)
const {t} = i18n.global
const onSubmit =async (mainData)=>{
   let data = null
   await formRef.value?.validate(async (error)=>{
    if(!error){
      data =
          {
      ...mainData,
      contract_to_date:Utils.timeToZone(store.form_32.contract_to_date),
      ...{
        pension: showPension.value? store.form_32.pension: undefined,
        salary_withholding: showSalaryWithholding.value? {
          ...store.form_32.salary_withholding,
          period1:Utils.timeToZone(store.form_32.salary_withholding.period1),
          period2:Utils.timeToZone(store.form_32.salary_withholding.period2),

        }: undefined,
        compensation: showCompensation.value? {
          ...store.form_32.compensation,
          period1:Utils.timeToZone(store.form_32.compensation.period1),
          period2:Utils.timeToZone(store.form_32.compensation.period2),
      } : undefined,
      }

      }

    }else{
      data = null
    }
  })

  return {
    data:data,
    isValid:Boolean(data),
  }
}

const showPension = computed(()=>Boolean(store.form_32.command_additional.find(v=>v === 'pension')))
const showCompensation = computed(()=>Boolean(store.form_32.command_additional.find(v=>v === 'compensation')))
const showSalaryWithholding = computed(()=>Boolean(store.form_32.command_additional.find(v=>v === 'salary_withholding')))


defineExpose({
  onSubmit
})
</script>

<template>
  <n-form
      ref="formRef"
      :model="store.form_32"
      :rules="validationRules.form_32"

      class="grid grid-cols-12 mb-8 gap-x-4 gap-y-2 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground">
    <div class="col-span-12 md:col-span-6 lg:col-span-3">
      <n-form-item :label="$t(`documentPage.command.form.contract_to_date`)" path="contract_to_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.form_32.contract_to_date"
            type="date"
            :format="useAppSetting.datePicketFormat"

        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-9">
      <n-form-item
          :show-feedback="false"
          :label="$t(`content.type`)">
        <n-select
            multiple
            v-model:value="store.form_32.command_additional"
            filterable
            :options="componentStore.deleteCommandEnum"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
        />
      </n-form-item>
    </div>

    <div v-if="showPension" class="col-span-12 grid grid-cols-12 gap-x-4 gap-y-2 p-2 border border-dashed rounded-lg border-surface-line bg-surface-section/80">
      <div class="col-span-12 text-xs">
        <n-button type="primary" secondary size="tiny">{{componentStore.deleteCommandEnum?.[0]?.name}}</n-button>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-2">
        <n-form-item
            :show-feedback="false"
            :label="$t(`content.year`)"
            path="pension.year"
        >
          <n-select
              v-model:value="store.form_32.pension.year"
              filterable
              clearable
              :options="Utils.yearList"
              label-field="name"
              value-field="id"
          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-2">
        <n-form-item
            :show-feedback="false"
            :label="$t(`documentPage.command.form.count`)"
            path="pension.count"
        >
          <n-input-number
              class="w-full"
              min="0"
              max="100"
              v-model:value="store.form_32.pension.count"
          />
        </n-form-item>
      </div>
    </div>
    <div v-if="showCompensation" class="col-span-12 grid grid-cols-12 gap-x-4 gap-y-2 p-2 border border-dashed rounded-lg border-surface-line bg-surface-section/80">
      <div class="col-span-12 text-xs">
        <n-button type="primary" secondary size="tiny">{{componentStore.deleteCommandEnum?.[2]?.name}}</n-button>
      </div>
      <LastVacationItem ref="lastVacationRef" />
      <div class="col-span-12 flex justify-center mb-1">
        <n-button
            :loading="store.vacationLoading"
            ghost
            size="tiny"
            @click="lastVacationRef.getLastVacation(store.payload.worker)"
        >
          <template #icon>
            <Eye24Regular/>
          </template>
          {{ $t('documentPage.command.lastVacation') }}
        </n-button>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-2">
        <n-form-item
            :show-feedback="false"
            :label="$t(`content.from`)"
            path="compensation.period1"
        >
          <n-date-picker
              class="w-full"
              v-model:value="store.form_32.compensation.period1"
              type="date"
              :format="useAppSetting.datePicketFormat"

          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-2">
        <n-form-item
            :show-feedback="false"
            :label="$t(`content.to`)"
            path="compensation.period2"
        >
          <n-date-picker
              class="w-full"
              v-model:value="store.form_32.compensation.period2"
              type="date"
              :format="useAppSetting.datePicketFormat"

          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-2">
        <n-form-item
            :show-feedback="false"
            :label="$t(`documentPage.command.form.all_day`)"
            path="pension.count"
        >
          <n-input-number
              class="w-full"
              min="0"
              max="1000"
              v-model:value="store.form_32.compensation.rest_day"
          />
        </n-form-item>
      </div>
    </div>
    <div v-if="showSalaryWithholding" class="col-span-12 grid grid-cols-12 gap-x-4 gap-y-2 p-2 border border-dashed rounded-lg border-surface-line bg-surface-section/80">
      <div class="col-span-12 text-xs">
        <n-button type="primary" secondary size="tiny">{{componentStore.deleteCommandEnum?.[1]?.name}}</n-button>
      </div>
      <LastVacationItem ref="lastVacationRef" />
      <div class="col-span-12 flex justify-center mb-1">
        <n-button
            :loading="store.vacationLoading"
            ghost
            size="tiny"
            @click="lastVacationRef.getLastVacation(store.payload.worker)"
        >
          <template #icon>
            <Eye24Regular/>
          </template>
          {{ $t('documentPage.command.lastVacation') }}
        </n-button>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-2">
        <n-form-item
            :show-feedback="false"
            :label="$t(`content.from`)"
            path="salary_withholding.period1"
        >
          <n-date-picker
              class="w-full"
              v-model:value="store.form_32.salary_withholding.period1"
              type="date"
              :format="useAppSetting.datePicketFormat"

          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-2">
        <n-form-item
            :show-feedback="false"
            :label="$t(`content.to`)"
            path="salary_withholding.period2"
        >
          <n-date-picker
              class="w-full"
              v-model:value="store.form_32.salary_withholding.period2"
              type="date"
              :format="useAppSetting.datePicketFormat"

          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-2">
        <n-form-item
            :show-feedback="false"
            :label="$t(`documentPage.command.form.all_day`)"
            path="salary_withholding.all_day"
        >
          <n-input-number
              class="w-full"
              min="0"
              max="1000"
              v-model:value="store.form_32.salary_withholding.all_day"
          />
        </n-form-item>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-2">
        <n-form-item
            :show-feedback="false"
            :label="$t(`documentPage.command.form.rest_day`)"
            path="salary_withholding.rest_day"
        >
          <n-input-number
              class="w-full"
              min="0"
              max="1000"
              v-model:value="store.form_32.salary_withholding.rest_day"
          />
        </n-form-item>
      </div>
    </div>



  </n-form>
</template>
